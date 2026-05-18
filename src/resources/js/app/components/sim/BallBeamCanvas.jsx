import React, { useEffect, useRef } from 'react';

const CANVAS_W = 420;
const CANVAS_H = 260;
const CENTER_Y_OFFSET = 20;
const BEAM_LENGTH = 160;
const BEAM_LINE_WIDTH = 7;
const BALL_RADIUS = 13;
const BALL_STROKE_WIDTH = 1.5;
const PIVOT_RADIUS = 6;
const PIVOT_STAND_LINE_WIDTH = 2;
const PIVOT_STAND_HEIGHT = 40;
const PIVOT_STAND_HALF_WIDTH = 18;
const BALL_POSITION_CLAMP = 1;
const INFO_FONT = '11px monospace';
const INFO_TEXT_X = 8;
const INFO_TEXT_Y = 16;

export function BallBeamCanvas({ frames, idx }) {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas || !frames?.length) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const [time, ballPos, , alpha] = frames[Math.min(idx, frames.length - 1)];

        ctx.clearRect(0, 0, W, H);

        const cx = W / 2, cy = H / 2 + CENTER_Y_OFFSET;
        const cos = Math.cos(alpha), sin = Math.sin(alpha);

        ctx.strokeStyle = '#374151';
        ctx.lineWidth = BEAM_LINE_WIDTH;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - BEAM_LENGTH * cos, cy - BEAM_LENGTH * (-sin));
        ctx.lineTo(cx + BEAM_LENGTH * cos, cy + BEAM_LENGTH * (-sin));
        ctx.stroke();

        // ball position: clamp r into [-1, 1] for the visual beam length
        const frac = Math.max(-BALL_POSITION_CLAMP, Math.min(BALL_POSITION_CLAMP, ballPos));
        const ballX = cx + frac * BEAM_LENGTH * cos;
        const ballY = cy + frac * BEAM_LENGTH * (-sin);

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = BALL_STROKE_WIDTH;
        ctx.stroke();

        ctx.fillStyle = '#6b7280';
        ctx.beginPath();
        ctx.arc(cx, cy, PIVOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = PIVOT_STAND_LINE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, cy + PIVOT_STAND_HEIGHT);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - PIVOT_STAND_HALF_WIDTH, cy + PIVOT_STAND_HEIGHT);
        ctx.lineTo(cx + PIVOT_STAND_HALF_WIDTH, cy + PIVOT_STAND_HEIGHT);
        ctx.stroke();

        ctx.fillStyle = '#6b7280';
        ctx.font = INFO_FONT;
        ctx.fillText(
            `t=${time.toFixed(2)}s  r=${ballPos.toFixed(3)}m  α=${(alpha * 180 / Math.PI).toFixed(2)}°`,
            INFO_TEXT_X, INFO_TEXT_Y
        );
    }, [frames, idx]);

    return (
        <canvas ref={ref} width={CANVAS_W} height={CANVAS_H}
            style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' }} />
    );
}
