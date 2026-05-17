import React, { useEffect, useRef } from 'react';

export function BallBeamCanvas({ frames, idx }) {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas || !frames?.length) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const [time, ballPos, , alpha] = frames[Math.min(idx, frames.length - 1)];

        ctx.clearRect(0, 0, W, H);

        const cx = W / 2, cy = H / 2 + 20;
        const beamLen = 160;
        const cos = Math.cos(alpha), sin = Math.sin(alpha);

        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - beamLen * cos, cy - beamLen * (-sin));
        ctx.lineTo(cx + beamLen * cos, cy + beamLen * (-sin));
        ctx.stroke();

        // ball position: clamp r into [-1, 1] for the visual beam length
        const frac = Math.max(-1, Math.min(1, ballPos));
        const ballX = cx + frac * beamLen * cos;
        const ballY = cy + frac * beamLen * (-sin);

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#6b7280';
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, cy + 40);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 18, cy + 40);
        ctx.lineTo(cx + 18, cy + 40);
        ctx.stroke();

        ctx.fillStyle = '#6b7280';
        ctx.font = '11px monospace';
        ctx.fillText(
            `t=${time.toFixed(2)}s  r=${ballPos.toFixed(3)}m  α=${(alpha * 180 / Math.PI).toFixed(2)}°`,
            8, 16
        );
    }, [frames, idx]);

    return (
        <canvas ref={ref} width={420} height={260}
            style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' }} />
    );
}
