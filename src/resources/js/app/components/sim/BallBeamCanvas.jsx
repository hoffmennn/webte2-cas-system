import React from 'react';
import {
    CANVAS_W, CANVAS_H, CANVAS_STYLE,
    INFO_FONT, INFO_TEXT_X, INFO_TEXT_Y,
    useCanvas2D,
} from './canvasShared';

/* ─── layout ─── */
const PIVOT_Y_OFFSET = -40;   // pivot above canvas mid (leaves room for fulcrum + ground)
const PIXELS_PER_METER = 320; // 1 m beam = 320 px on screen
const BEAM_HALF_PX     = PIXELS_PER_METER / 2;
const BEAM_LINE_WIDTH  = 8;

/* ─── ball ─── */
const BALL_RADIUS         = 14;
const BALL_STROKE_WIDTH   = 1.5;
const BALL_POSITION_CLAMP = 0.5; // beam ends at r = ±0.5 m

/* ─── pivot pin ─── */
const PIVOT_RADIUS     = 5;
const PIVOT_HUB_RADIUS = 2;

/* ─── triangular fulcrum support ─── */
const FULCRUM_HEIGHT    = 78;
const FULCRUM_BASE_HALF = 36;
const FULCRUM_BOLT_R    = 2;

/* ─── ground (under fulcrum) ─── */
const GROUND_HALF_W    = 100;
const GROUND_HATCH_N   = 11;
const GROUND_HATCH_DX  = 14;
const GROUND_HATCH_LEN = 7;

/**
 * Ball-on-beam visualization. The beam pivots at its CENTER on a fixed
 * triangular fulcrum (see-saw style). Ball position r is measured from the
 * beam centre and clamped to ±0.5 m so it stays on the beam. State-space
 * model lives in gulicka.txt (CTMS reference).
 */
export function BallBeamCanvas({ frames, idx }) {
    const ref = useCanvas2D(frames, idx, (ctx, frame, W, H) => {
        const [time, ballPos, , alpha] = frame;

        const px = W / 2;
        const py = H / 2 + PIVOT_Y_OFFSET;
        const cos = Math.cos(alpha), sin = Math.sin(alpha);

        const groundY = py + FULCRUM_HEIGHT;

        /* ─── ground (drawn first so fulcrum sits on top) ─── */
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(px - GROUND_HALF_W, groundY);
        ctx.lineTo(px + GROUND_HALF_W, groundY);
        ctx.stroke();

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        const hatchStart = -Math.floor(GROUND_HATCH_N / 2);
        for (let i = 0; i < GROUND_HATCH_N; i++) {
            const x = px + (hatchStart + i) * GROUND_HATCH_DX;
            ctx.beginPath();
            ctx.moveTo(x, groundY);
            ctx.lineTo(x - 6, groundY + GROUND_HATCH_LEN);
            ctx.stroke();
        }

        /* ─── fulcrum triangle support (centered under pivot) ─── */
        const baseLeftX  = px - FULCRUM_BASE_HALF;
        const baseRightX = px + FULCRUM_BASE_HALF;

        const fulcrumGradient = ctx.createLinearGradient(baseLeftX, groundY, baseRightX, groundY);
        fulcrumGradient.addColorStop(0,    '#cbd5e1');
        fulcrumGradient.addColorStop(0.45, '#94a3b8');
        fulcrumGradient.addColorStop(0.55, '#94a3b8');
        fulcrumGradient.addColorStop(1,    '#64748b');
        ctx.fillStyle = fulcrumGradient;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(baseLeftX, groundY);
        ctx.lineTo(baseRightX, groundY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // small mounting bolts on the fulcrum face
        ctx.fillStyle = '#475569';
        [-10, 10].forEach(dx => {
            ctx.beginPath();
            ctx.arc(px + dx, py + FULCRUM_HEIGHT * 0.55, FULCRUM_BOLT_R, 0, Math.PI * 2);
            ctx.fill();
        });

        /* ─── beam (symmetric around pivot) ─── */
        // Tilt: +α (display) → left end DOWN, right end UP (consistent with how
        // SimPanel flips the angle; see flipAngle there).
        const rightEndX = px + BEAM_HALF_PX * cos;
        const rightEndY = py - BEAM_HALF_PX * sin;
        const leftEndX  = px - BEAM_HALF_PX * cos;
        const leftEndY  = py + BEAM_HALF_PX * sin;

        // shadow
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.18)';
        ctx.lineWidth = BEAM_LINE_WIDTH;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(leftEndX, leftEndY + 3);
        ctx.lineTo(rightEndX, rightEndY + 3);
        ctx.stroke();

        // beam (vertical gradient for a flat-bar look)
        const beamGradient = ctx.createLinearGradient(0, py - BEAM_LINE_WIDTH / 2, 0, py + BEAM_LINE_WIDTH / 2);
        beamGradient.addColorStop(0,   '#475569');
        beamGradient.addColorStop(0.5, '#1f2937');
        beamGradient.addColorStop(1,   '#0f172a');
        ctx.strokeStyle = beamGradient;
        ctx.lineWidth = BEAM_LINE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(leftEndX, leftEndY);
        ctx.lineTo(rightEndX, rightEndY);
        ctx.stroke();

        /* ─── pivot pin (on top of fulcrum apex) ─── */
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(px, py, PIVOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(px, py, PIVOT_HUB_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        /* ─── ball with radial gradient (sits ON TOP of beam) ─── */
        const r = Math.max(-BALL_POSITION_CLAMP, Math.min(BALL_POSITION_CLAMP, ballPos));
        const ballAlongX = px + r * PIXELS_PER_METER * cos;
        const ballAlongY = py - r * PIXELS_PER_METER * sin;

        // Normal pointing "above" the beam (= away from the fulcrum).
        // In canvas y-down coords this is (-sin, -cos) relative to the
        // beam direction (cos, -sin).
        const normalOffset = BEAM_LINE_WIDTH / 2 + BALL_RADIUS;
        const ballX = ballAlongX - normalOffset * sin;
        const ballY = ballAlongY - normalOffset * cos;

        // soft cast shadow on the beam directly under the ball
        ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
        ctx.beginPath();
        ctx.ellipse(ballAlongX, ballAlongY + 2, BALL_RADIUS * 0.7, BALL_RADIUS * 0.25, alpha, 0, Math.PI * 2);
        ctx.fill();

        const ballGradient = ctx.createRadialGradient(
            ballX - BALL_RADIUS * 0.35, ballY - BALL_RADIUS * 0.35, 1,
            ballX, ballY, BALL_RADIUS
        );
        ballGradient.addColorStop(0,   '#fef3c7');
        ballGradient.addColorStop(0.5, '#f59e0b');
        ballGradient.addColorStop(1,   '#b45309');
        ctx.fillStyle = ballGradient;
        ctx.beginPath();
        ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = BALL_STROKE_WIDTH;
        ctx.stroke();

        /* ─── readout ─── */
        ctx.fillStyle = '#6b7280';
        ctx.font = INFO_FONT;
        ctx.fillText(
            `t=${time.toFixed(2)}s  r=${ballPos.toFixed(3)}m  α=${(alpha * 180 / Math.PI).toFixed(2)}°`,
            INFO_TEXT_X, INFO_TEXT_Y
        );
    });

    return <canvas ref={ref} width={CANVAS_W} height={CANVAS_H} style={CANVAS_STYLE} />;
}
