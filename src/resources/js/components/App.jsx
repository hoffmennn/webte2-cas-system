import React, { useState, useRef, useEffect } from 'react';

const API_BASE = '/api';

const T = {
    en: {
        title: 'CAS Interface',
        apiKey: 'API Key',
        save: 'Save',
        console: 'Console',
        pendulum: 'Inverted Pendulum',
        ballBeam: 'Ball-Beam',
        execute: 'Execute',
        run: 'Run Simulation',
        output: 'Output',
        params: 'Parameters',
        loading: 'Running…',
        session: 'Session',
        newSession: 'New Session',
        clearOutput: 'Clear',
        commandHint: 'Octave command (Ctrl+Enter to run)',
        noApiKey: 'Enter your API key in the header to use the API.',
        readyLabel: 'API Ready',
        dt: 'Time step dt (s)',
        tmax: 'Duration tmax (s)',
    },
    sk: {
        title: 'CAS Rozhranie',
        apiKey: 'API Kľúč',
        save: 'Uložiť',
        console: 'Konzola',
        pendulum: 'Invertné Kyvadlo',
        ballBeam: 'Gulička na Tyči',
        execute: 'Vykonať',
        run: 'Spustiť simuláciu',
        output: 'Výstup',
        params: 'Parametre',
        loading: 'Prebieha…',
        session: 'Relácia',
        newSession: 'Nová relácia',
        clearOutput: 'Vyčistiť',
        commandHint: 'Príkaz Octave (Ctrl+Enter na spustenie)',
        noApiKey: 'Zadaj API kľúč v hlavičke pre použitie API.',
        readyLabel: 'API pripravené',
        dt: 'Časový krok dt (s)',
        tmax: 'Trvanie tmax (s)',
    },
};

/* ────────────────────────────────────────────────────────── SVG line chart */
function LineChart({ data, series, height = 180 }) {
    if (!data || data.length < 2) return null;

    const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b'];
    const W = 600, H = height;
    const pad = { t: 12, r: 16, b: 28, l: 44 };
    const iW = W - pad.l - pad.r;
    const iH = H - pad.t - pad.b;

    const ts = data.map(r => r[0]);
    const tMin = ts[0], tRange = ts[ts.length - 1] - tMin || 1;

    const allVals = series.flatMap(idx => data.map(r => r[idx]));
    const vMin = Math.min(...allVals), vMax = Math.max(...allVals);
    const vRange = vMax - vMin || 1;

    const sx = v => pad.l + ((v - tMin) / tRange) * iW;
    const sy = v => pad.t + (1 - (v - vMin) / vRange) * iH;

    const yTicks = 4;
    const xTicks = 5;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }}>
            {Array.from({ length: yTicks + 1 }, (_, i) => {
                const y = pad.t + (i / yTicks) * iH;
                const v = vMax - (i / yTicks) * vRange;
                return (
                    <g key={i}>
                        <line x1={pad.l} y1={y} x2={pad.l + iW} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                        <text x={pad.l - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
                            {v.toFixed(2)}
                        </text>
                    </g>
                );
            })}
            {Array.from({ length: xTicks + 1 }, (_, i) => {
                const x = pad.l + (i / xTicks) * iW;
                const v = tMin + (i / xTicks) * tRange;
                return (
                    <text key={i} x={x} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">
                        {v.toFixed(1)}s
                    </text>
                );
            })}
            {series.map((idx, si) => {
                const pts = data.map(r => `${sx(r[0])},${sy(r[idx])}`).join(' L ');
                return (
                    <path key={idx} d={`M ${pts}`} fill="none" stroke={COLORS[si % COLORS.length]} strokeWidth="1.5" />
                );
            })}
        </svg>
    );
}

/* ─────────────────────────────────────── animation frame player hook */
function usePlayer(frames) {
    const [idx, setIdx] = useState(0);
    const [playing, setPlaying] = useState(false);
    const raf = useRef(null);
    const last = useRef(null);

    useEffect(() => { setIdx(0); setPlaying(false); }, [frames]);

    useEffect(() => {
        if (!playing || !frames?.length) { cancelAnimationFrame(raf.current); return; }
        const tick = now => {
            if (!last.current) last.current = now;
            if (now - last.current >= 40) { // ~25 fps
                last.current = now;
                setIdx(prev => {
                    if (prev >= frames.length - 1) { setPlaying(false); return prev; }
                    return prev + 1;
                });
            }
            raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [playing, frames]);

    return { idx, setIdx, playing, setPlaying };
}

/* ─────────────────────────────────────── inverted pendulum canvas */
function PendulumCanvas({ frames, idx }) {
    const ref = useRef(null);
    useEffect(() => {
        const canvas = ref.current;
        if (!canvas || !frames?.length) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const [t, x, , theta] = frames[Math.min(idx, frames.length - 1)];

        ctx.clearRect(0, 0, W, H);

        // track
        const trackY = H * 0.68;
        ctx.strokeStyle = '#4b5563'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(20, trackY); ctx.lineTo(W - 20, trackY); ctx.stroke();

        // cart
        const cartX = W / 2 + x * 55;
        const cW = 58, cH = 28;
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.roundRect(cartX - cW / 2, trackY - cH, cW, cH, 4);
        ctx.fill();

        // wheels
        [[cartX - 16, trackY + 6], [cartX + 16, trackY + 6]].forEach(([wx, wy]) => {
            ctx.fillStyle = '#1e40af';
            ctx.beginPath(); ctx.arc(wx, wy, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#dbeafe';
            ctx.beginPath(); ctx.arc(wx, wy, 2.5, 0, Math.PI * 2); ctx.fill();
        });

        // rod
        const pivX = cartX, pivY = trackY - cH;
        const rodLen = 90;
        const tipX = pivX + rodLen * Math.sin(theta);
        const tipY = pivY - rodLen * Math.cos(theta);
        ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(pivX, pivY); ctx.lineTo(tipX, tipY); ctx.stroke();

        // bob
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(tipX, tipY, 9, 0, Math.PI * 2); ctx.fill();

        // label
        ctx.fillStyle = '#6b7280'; ctx.font = '11px monospace';
        ctx.fillText(`t=${t.toFixed(2)}s  x=${x.toFixed(3)}m  θ=${(theta * 180 / Math.PI).toFixed(1)}°`, 8, 16);
    }, [frames, idx]);

    return (
        <canvas ref={ref} width={420} height={260}
            style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' }} />
    );
}

/* ─────────────────────────────────────── ball-beam canvas */
function BallBeamCanvas({ frames, idx }) {
    const ref = useRef(null);
    useEffect(() => {
        const canvas = ref.current;
        if (!canvas || !frames?.length) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const [t, r, , alpha] = frames[Math.min(idx, frames.length - 1)];

        ctx.clearRect(0, 0, W, H);

        const cx = W / 2, cy = H / 2 + 20;
        const beamLen = 160;
        const cos = Math.cos(alpha), sin = Math.sin(alpha);

        // beam
        ctx.strokeStyle = '#374151'; ctx.lineWidth = 7; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - beamLen * cos, cy - beamLen * (-sin));
        ctx.lineTo(cx + beamLen * cos, cy + beamLen * (-sin));
        ctx.stroke();

        // ball position: r is in [-L/2, L/2], normalize to [-1,1] for beamLen
        const frac = Math.max(-1, Math.min(1, r));
        const ballX = cx + frac * beamLen * cos;
        const ballY = cy + frac * beamLen * (-sin);

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(ballX, ballY, 13, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#d97706'; ctx.lineWidth = 1.5; ctx.stroke();

        // pivot
        ctx.fillStyle = '#6b7280';
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();

        // pedestal
        ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + 40); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - 18, cy + 40); ctx.lineTo(cx + 18, cy + 40); ctx.stroke();

        // label
        ctx.fillStyle = '#6b7280'; ctx.font = '11px monospace';
        ctx.fillText(`t=${t.toFixed(2)}s  r=${r.toFixed(3)}m  α=${(alpha * 180 / Math.PI).toFixed(2)}°`, 8, 16);
    }, [frames, idx]);

    return (
        <canvas ref={ref} width={420} height={260}
            style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' }} />
    );
}

/* ─────────────────────────────────────── simulation panel */
const PENDULUM_PARAMS = [
    { key: 'M',      label: 'Cart mass M (kg)',     default: 0.5,   step: 0.1 },
    { key: 'm',      label: 'Pendulum mass m (kg)', default: 0.2,   step: 0.05 },
    { key: 'b',      label: 'Friction b',           default: 0.1,   step: 0.01 },
    { key: 'I',      label: 'Inertia I',            default: 0.006, step: 0.001 },
    { key: 'l',      label: 'Rod length l (m)',     default: 0.3,   step: 0.05 },
    { key: 'theta0', label: 'Initial angle θ₀ (rad)', default: 0.1, step: 0.01 },
    { key: 'dt',     label: 'Time step dt (s)',     default: 0.05,  step: 0.01 },
    { key: 'tmax',   label: 'Duration tmax (s)',    default: 5,     step: 1 },
];

const BALLBEAM_PARAMS = [
    { key: 'm',    label: 'Ball mass m (kg)',     default: 0.111,  step: 0.01 },
    { key: 'R',    label: 'Ball radius R (m)',    default: 0.015,  step: 0.001 },
    { key: 'd',    label: 'Gear ratio d',         default: 0.03,   step: 0.005 },
    { key: 'L',    label: 'Beam length L (m)',    default: 1.0,    step: 0.1 },
    { key: 'J',    label: 'Inertia J',            default: 9.99e-6, step: 1e-6 },
    { key: 'r0',   label: 'Initial position r₀ (m)', default: 0.0, step: 0.05 },
    { key: 'dt',   label: 'Time step dt (s)',     default: 0.05,   step: 0.01 },
    { key: 'tmax', label: 'Duration tmax (s)',    default: 5,      step: 1 },
];

const SERIES_LABELS = {
    'inverted-pendulum': ['t', 'x (pos)', 'ẋ (vel)', 'θ (angle)', 'θ̇ (ang. vel)'],
    'ball-beam':         ['t', 'r (pos)', 'ṙ (vel)', 'α (angle)', 'α̇ (ang. vel)'],
};

function SimPanel({ type, apiKey, t }) {
    const paramDefs = type === 'inverted-pendulum' ? PENDULUM_PARAMS : BALLBEAM_PARAMS;
    const [params, setParams] = useState(() =>
        Object.fromEntries(paramDefs.map(p => [p.key, p.default]))
    );
    const [frames, setFrames] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [series, setSeries] = useState([1, 3]);
    const { idx, setIdx, playing, setPlaying } = usePlayer(frames);

    const run = async () => {
        if (!apiKey) return;
        setLoading(true); setError(null);
        try {
            const res = await fetch(`${API_BASE}/animate/${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
                body: JSON.stringify(params),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                setError(json.error || json.details || `HTTP ${res.status}`);
            } else {
                setFrames(json.data);
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const labels = SERIES_LABELS[type];
    const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b'];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>
            {/* ── Params ── */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16 }}>
                <h3 style={{ margin: '0 0 12px', fontWeight: 600, fontSize: 14 }}>{t.params}</h3>
                {paramDefs.map(p => (
                    <div key={p.key} style={{ marginBottom: 10 }}>
                        <label style={{ display: 'block', fontSize: 11, color: '#6b7280', marginBottom: 3 }}>{p.label}</label>
                        <input type="number" value={params[p.key]} step={p.step}
                            onChange={e => setParams(prev => ({ ...prev, [p.key]: parseFloat(e.target.value) || 0 }))}
                            style={{ width: '100%', padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: 5, fontSize: 13, boxSizing: 'border-box' }} />
                    </div>
                ))}
                <button onClick={run} disabled={loading || !apiKey}
                    style={{ width: '100%', padding: '9px 0', background: loading || !apiKey ? '#9ca3af' : '#3b82f6', color: '#fff', border: 'none', borderRadius: 7, cursor: loading || !apiKey ? 'default' : 'pointer', fontWeight: 600, marginTop: 4 }}>
                    {loading ? t.loading : t.run}
                </button>
                {!apiKey && <p style={{ color: '#f59e0b', fontSize: 12, margin: '8px 0 0' }}>Set API key first.</p>}
                {error && (
                    <div style={{ marginTop: 10, padding: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#dc2626', fontSize: 12 }}>
                        {error}
                    </div>
                )}
            </div>

            {/* ── Output ── */}
            <div>
                {frames ? (
                    <>
                        {type === 'inverted-pendulum'
                            ? <PendulumCanvas frames={frames} idx={idx} />
                            : <BallBeamCanvas frames={frames} idx={idx} />
                        }

                        {/* Playback */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
                            <button onClick={() => setPlaying(p => !p)}
                                style={{ padding: '4px 14px', border: '1px solid #d1d5db', borderRadius: 5, cursor: 'pointer', background: '#fff', fontSize: 16 }}>
                                {playing ? '⏸' : '▶'}
                            </button>
                            <button onClick={() => { setIdx(0); setPlaying(false); }}
                                style={{ padding: '4px 14px', border: '1px solid #d1d5db', borderRadius: 5, cursor: 'pointer', background: '#fff', fontSize: 16 }}>
                                ⏮
                            </button>
                            <input type="range" min={0} max={frames.length - 1} value={idx}
                                onChange={e => { setPlaying(false); setIdx(+e.target.value); }}
                                style={{ flex: 1 }} />
                            <span style={{ fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{idx + 1}/{frames.length}</span>
                        </div>

                        {/* Series selector */}
                        <div style={{ display: 'flex', gap: 14, marginBottom: 8, flexWrap: 'wrap' }}>
                            {[1, 2, 3, 4].map((serIdx, i) => (
                                <label key={serIdx} style={{ fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <input type="checkbox" checked={series.includes(serIdx)}
                                        onChange={e => setSeries(prev => e.target.checked ? [...prev, serIdx] : prev.filter(s => s !== serIdx))} />
                                    <span style={{ color: COLORS[i] }}>{labels[serIdx]}</span>
                                </label>
                            ))}
                        </div>

                        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 8px 4px' }}>
                            <LineChart data={frames} series={[...series].sort()} height={180} />
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, border: '2px dashed #e5e7eb', borderRadius: 10, color: '#9ca3af', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: 32 }}>▶</span>
                        <span style={{ fontSize: 14 }}>Set parameters and click "{t.run}"</span>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────── console */
function ConsolePanel({ apiKey, t }) {
    const [command, setCommand] = useState('');
    const [output, setOutput] = useState('');
    const [session, setSession] = useState(() => localStorage.getItem('cas_session') || '');
    const [loading, setLoading] = useState(false);

    const execute = async () => {
        if (!command.trim() || !apiKey) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
                body: JSON.stringify({ command, session_token: session || undefined }),
            });
            const json = await res.json();
            if (json.session_token) {
                localStorage.setItem('cas_session', json.session_token);
                setSession(json.session_token);
            }
            const resultLine = json.success
                ? (json.output || '(no output)')
                : `[ERROR] ${json.error || 'Unknown error'}`;
            setOutput(prev => prev + `>> ${command}\n${resultLine}\n\n`);
        } catch (e) {
            setOutput(prev => prev + `>> ${command}\n[ERROR] ${e.message}\n\n`);
        } finally {
            setLoading(false);
        }
    };

    const newSession = () => {
        localStorage.removeItem('cas_session');
        setSession('');
        setOutput('');
    };

    return (
        <div style={{ maxWidth: 860 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>
                    {t.session}: <code style={{ fontSize: 11, background: '#f3f4f6', padding: '1px 4px', borderRadius: 3 }}>
                        {session ? session.slice(0, 20) + '…' : '(none)'}
                    </code>
                </span>
                <button onClick={newSession}
                    style={{ fontSize: 12, padding: '2px 10px', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', background: '#fff' }}>
                    {t.newSession}
                </button>
            </div>

            {!apiKey && (
                <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 7, color: '#92400e', fontSize: 13, marginBottom: 10 }}>
                    ⚠ {t.noApiKey}
                </div>
            )}

            <textarea value={command} onChange={e => setCommand(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) execute(); }}
                placeholder={t.commandHint + '\n\nExample:\na = 1 + 1\na + 2'}
                style={{ width: '100%', minHeight: 130, padding: 12, fontFamily: 'monospace', fontSize: 13, border: '1px solid #374151', borderRadius: 7, resize: 'vertical', background: '#1e1e2e', color: '#cdd6f4', boxSizing: 'border-box', outline: 'none' }}
            />

            <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
                <button onClick={execute} disabled={loading || !apiKey || !command.trim()}
                    style={{ padding: '8px 24px', background: loading || !apiKey || !command.trim() ? '#9ca3af' : '#3b82f6', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontWeight: 600 }}>
                    {loading ? t.loading : t.execute}
                </button>
                <button onClick={() => setOutput('')}
                    style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 7, cursor: 'pointer', background: '#fff' }}>
                    {t.clearOutput}
                </button>
            </div>

            <pre style={{ background: '#1e1e2e', color: '#cdd6f4', padding: 16, borderRadius: 7, minHeight: 220, fontFamily: 'monospace', fontSize: 13, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                {output || '(output will appear here)'}
            </pre>
        </div>
    );
}

/* ─────────────────────────────────────── root app */
export default function App() {
    const [lang, setLang] = useState('en');
    const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('cas_api_key') || '');
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('cas_api_key') || '');
    const [tab, setTab] = useState('console');

    const t = T[lang];

    const saveKey = () => {
        localStorage.setItem('cas_api_key', apiKeyInput);
        setApiKey(apiKeyInput);
    };

    const tabs = [
        { key: 'console',  label: t.console },
        { key: 'pendulum', label: t.pendulum },
        { key: 'ballbeam', label: t.ballBeam },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: '"Inter", system-ui, sans-serif' }}>
            {/* Header */}
            <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
                <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    {t.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Lang toggle */}
                    <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
                        {['en', 'sk'].map(l => (
                            <button key={l} onClick={() => setLang(l)}
                                style={{ padding: '4px 12px', border: 'none', cursor: 'pointer', background: lang === l ? '#0f172a' : '#fff', color: lang === l ? '#fff' : '#64748b', fontWeight: lang === l ? 600 : 400, fontSize: 12 }}>
                                {l.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* API key */}
                    <div style={{ display: 'flex', gap: 6 }}>
                        <input type="password" placeholder={t.apiKey} value={apiKeyInput}
                            onChange={e => setApiKeyInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveKey()}
                            style={{ padding: '5px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, width: 190 }} />
                        <button onClick={saveKey}
                            style={{ padding: '5px 14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                            {t.save}
                        </button>
                    </div>

                    {apiKey && (
                        <span style={{ fontSize: 12, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 7, height: 7, background: '#16a34a', borderRadius: '50%', display: 'inline-block' }} />
                            {t.readyLabel}
                        </span>
                    )}
                </div>
            </header>

            {/* Tab bar */}
            <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', display: 'flex' }}>
                {tabs.map(tb => (
                    <button key={tb.key} onClick={() => setTab(tb.key)}
                        style={{ padding: '12px 20px', border: 'none', borderBottom: tab === tb.key ? '2px solid #3b82f6' : '2px solid transparent', background: 'none', cursor: 'pointer', fontWeight: tab === tb.key ? 600 : 400, color: tab === tb.key ? '#3b82f6' : '#64748b', fontSize: 14, marginBottom: -1 }}>
                        {tb.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <main style={{ maxWidth: 1200, margin: '0 auto', padding: 28 }}>
                {tab === 'console'  && <ConsolePanel apiKey={apiKey} t={t} />}
                {tab === 'pendulum' && <SimPanel type="inverted-pendulum" apiKey={apiKey} t={t} />}
                {tab === 'ballbeam' && <SimPanel type="ball-beam"         apiKey={apiKey} t={t} />}
            </main>
        </div>
    );
}
