<?php

namespace App\Services;

class OctaveService
{
    private string $binary;
    private float $slowdown;
    private string $sessionDir;
    private int $timeout;

    public function __construct()
    {
        $this->binary     = config('cas.octave_binary', '/usr/bin/octave');
        $this->slowdown   = (float) config('cas.slowdown_coefficient', 0);
        $this->sessionDir = config('cas.session_dir', '/tmp');
        $this->timeout    = (int) config('cas.execution_timeout', 30);
    }

    /**
     * Execute an arbitrary Octave command inside a persistent session workspace.
     * Variables set in one request are available in subsequent requests sharing the same token.
     */
    public function execute(string $command, string $sessionToken): array
    {
        $matFile = $this->matFilePath($sessionToken);

        $script = "more off;\n";
        if (file_exists($matFile) && filesize($matFile) > 0) {
            $escaped = addslashes($matFile);
            $script .= "load('{$escaped}');\n";
        }
        $script .= $command . "\n";
        // Remove 'ans' so it does not pollute the saved workspace
        $script .= "if (exist('ans', 'var')); clear ans; end;\n";
        $escaped = addslashes($matFile);
        $script .= "save('{$escaped}');\n";

        $this->applySlowdown();

        return $this->runScript($script);
    }

    /**
     * Simulate the inverted pendulum using a closed-loop LQR controller.
     * Returns JSON array: [[t, x, x_dot, theta, theta_dot], ...]
     *
     * State: x = cart position, theta = pendulum angle from vertical (rad).
     * Parameters match the CTMS inverted pendulum model.
     */
    public function computeInvertedPendulum(array $params): array
    {
        $M      = (float) ($params['M']      ?? 0.5);
        $m      = (float) ($params['m']      ?? 0.2);
        $b      = (float) ($params['b']      ?? 0.1);
        $Ival   = (float) ($params['I']      ?? 0.006);
        $l      = (float) ($params['l']      ?? 0.3);
        $theta0 = (float) ($params['theta0'] ?? 0.1);
        $dt     = max(0.01, min(0.1,  (float) ($params['dt']   ?? 0.05)));
        $tmax   = max(1.0,  min(20.0, (float) ($params['tmax'] ?? 5.0)));

        $script = <<<OCTAVE
more off;
pkg load control;
M_c={$M}; m_p={$m}; b_c={$b}; I_p={$Ival}; g_c=9.8; l_p={$l};
p_ = I_p*(M_c+m_p) + M_c*m_p*l_p^2;
A_ = [0 1 0 0; ...
      0 -(I_p+m_p*l_p^2)*b_c/p_ (m_p^2*g_c*l_p^2)/p_ 0; ...
      0 0 0 1; ...
      0 -(m_p*l_p*b_c)/p_ m_p*g_c*l_p*(M_c+m_p)/p_ 0];
B_ = [0; (I_p+m_p*l_p^2)/p_; 0; m_p*l_p/p_];
C_ = [1 0 0 0; 0 0 1 0];
Q_ = C_'*C_;
R_ = 0.001;
K_ = lqr(A_, B_, Q_, R_);
Ac = A_ - B_*K_;
x0_ = [0; 0; {$theta0}; 0];
dt_={$dt}; tmax_={$tmax};
t_ = 0:dt_:tmax_;
N_ = length(t_);
xs_ = zeros(4, N_);
xs_(:,1) = x0_;
for ii=2:N_
  xs_(:,ii) = xs_(:,ii-1) + dt_*(Ac*xs_(:,ii-1));
end
printf('[');
for ii=1:N_
  printf('[%.6f,%.6f,%.6f,%.6f,%.6f]', t_(ii), xs_(1,ii), xs_(2,ii), xs_(3,ii), xs_(4,ii));
  if ii < N_; printf(','); end;
end
printf(']');
OCTAVE;

        $this->applySlowdown();

        return $this->runScript($script);
    }

    /**
     * Simulate the ball-on-beam system using a closed-loop LQR controller.
     * Returns JSON array: [[t, r, r_dot, alpha, alpha_dot], ...]
     *
     * State: r = ball position (m), alpha = beam angle (rad).
     * Linearized model and H coefficient follow the reference Octave script
     * (workspace root `gulicka.txt`): H = -m*g/(J/R^2 + m), with g = -9.8.
     */
    public function computeBallBeam(array $params): array
    {
        $m     = (float) ($params['m']    ?? 0.111);
        $R     = (float) ($params['R']    ?? 0.015);
        $Jval  = (float) ($params['J']    ?? 9.99e-6);
        $r0    = (float) ($params['r0']   ?? 0.0);
        $dt    = max(0.01, min(0.1,  (float) ($params['dt']   ?? 0.05)));
        $tmax  = max(1.0,  min(20.0, (float) ($params['tmax'] ?? 5.0)));

        $script = <<<OCTAVE
more off;
pkg load control;
m_b={$m}; R_b={$R}; g_b=-9.8; J_b={$Jval};
H_ = -m_b*g_b/(J_b/(R_b^2)+m_b);
A_ = [0 1 0 0; 0 0 H_ 0; 0 0 0 1; 0 0 0 0];
B_ = [0; 0; 0; 1];
C_ = [1 0 0 0; 0 0 1 0];
Q_ = C_'*C_;
R_ = 0.01;
K_ = lqr(A_, B_, Q_, R_);
Ac = A_ - B_*K_;
x0_ = [{$r0}; 0; 0; 0];
dt_={$dt}; tmax_={$tmax};
t_ = 0:dt_:tmax_;
N_ = length(t_);
xs_ = zeros(4, N_);
xs_(:,1) = x0_;
for ii=2:N_
  xs_(:,ii) = xs_(:,ii-1) + dt_*(Ac*xs_(:,ii-1));
end
printf('[');
for ii=1:N_
  printf('[%.6f,%.6f,%.6f,%.6f,%.6f]', t_(ii), xs_(1,ii), xs_(2,ii), xs_(3,ii), xs_(4,ii));
  if ii < N_; printf(','); end;
end
printf(']');
OCTAVE;

        $this->applySlowdown();

        return $this->runScript($script);
    }

    /**
     * Filter raw Octave stderr down to lines that look like real Octave
     * diagnostics: `error:`, `parse error`, `warning:` and their indented
     * continuation lines. Drops PHP/proc_open noise, the per-run
     * `execution_exception` shutdown chatter, and any line that leaks the
     * internal `/tmp/cas_oct_*.m` temp-file path.
     */
    public static function filterStderr(string $stderr): string
    {
        $kept = [];
        $keeping = false;

        foreach (preg_split('/\r?\n/', $stderr) as $line) {
            // The "could not source the temp file" line is how Octave reports a
            // syntax error in our setup. The line itself leaks the temp path,
            // so we substitute a clean synthesized parse-error message.
            if (self::isSourceFileError($line)) {
                $kept[] = 'parse error: command could not be parsed';
                $keeping = false;
                continue;
            }

            if (self::isNoiseLine($line)) {
                $keeping = false;
                continue;
            }

            if (preg_match('/^\s*(error:|parse error|warning:)/i', $line)) {
                $kept[] = $line;
                $keeping = true;
                continue;
            }

            if ($keeping && $line !== '' && ctype_space($line[0])) {
                $kept[] = $line;
                continue;
            }

            $keeping = false;
        }

        return trim(implode("\n", $kept));
    }

    private static function isSourceFileError(string $line): bool
    {
        return preg_match('/^\s*error:\s+source:\s+error sourcing file/i', $line) === 1;
    }

    private static function isNoiseLine(string $line): bool
    {
        return str_contains($line, 'ignoring const execution_exception')
            || str_contains($line, 'cas_oct_')
            || preg_match('/^\s*error:\s*called from/i', $line) === 1;
    }

    // -------------------------------------------------------------------------

    private function matFilePath(string $token): string
    {
        $safe = preg_replace('/[^a-zA-Z0-9]/', '', $token);

        return $this->sessionDir . '/cas_sess_' . $safe . '.mat';
    }

    private function applySlowdown(): void
    {
        if ($this->slowdown > 0) {
            usleep((int) ($this->slowdown * 1_000_000));
        }
    }

    private function runScript(string $script): array
    {
        $tmpFile = tempnam(sys_get_temp_dir(), 'cas_oct_') . '.m';
        file_put_contents($tmpFile, $script);

        $cmd = 'timeout ' . $this->timeout . ' '
            . escapeshellcmd($this->binary)
            . ' --no-gui --norc '
            . escapeshellarg($tmpFile);

        $descriptors = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ];

        $process = proc_open($cmd, $descriptors, $pipes);

        if (! is_resource($process)) {
            @unlink($tmpFile);

            return ['output' => '', 'error' => 'Failed to start Octave process.', 'success' => false];
        }

        fclose($pipes[0]);
        $stdout   = stream_get_contents($pipes[1]);
        $stderr   = stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        $exitCode = proc_close($process);

        @unlink($tmpFile);

        return [
            'output'    => $stdout,
            'error'     => $stderr,
            'success'   => $exitCode === 0,
            'exit_code' => $exitCode,
        ];
    }
}
