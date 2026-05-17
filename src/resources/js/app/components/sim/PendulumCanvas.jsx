import React, { useEffect, useRef } from 'react';

export function PendulumCanvas({ frames, idx }) {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas || !frames?.length) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const [time, cartPos, , theta] = frames[Math.min(idx, frames.length - 1)];

        ctx.clearRect(0, 0, W, H);

        const trackY = H * 0.68;
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(20, trackY);
        ctx.lineTo(W - 20, trackY);
        ctx.stroke();

        const cartX = W / 2 + cartPos * 55;
        const cartW = 58, cartH = 28;
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.roundRect(cartX - cartW / 2, trackY - cartH, cartW, cartH, 4);
        ctx.fill();

        const wheels = [[cartX - 16, trackY + 6], [cartX + 16, trackY + 6]];
        wheels.forEach(([wx, wy]) => {
            ctx.fillStyle = '#1e40af';
            ctx.beginPath();
            ctx.arc(wx, wy, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#dbeafe';
            ctx.beginPath();
            ctx.arc(wx, wy, 2.5, 0, Math.PI * 2);
            ctx.fill();
        });

        const pivotX = cartX, pivotY = trackY - cartH;
        const rodLen = 90;
        const tipX = pivotX + rodLen * Math.sin(theta);
        const tipY = pivotY - rodLen * Math.cos(theta);
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(tipX, tipY, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#6b7280';
        ctx.font = '11px monospace';
        ctx.fillText(
            `t=${time.toFixed(2)}s  x=${cartPos.toFixed(3)}m  θ=${(theta * 180 / Math.PI).toFixed(1)}°`,
            8, 16
        );
    }, [frames, idx]);

    return (
        <canvas ref={ref} width={420} height={260}
            style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' }} />
    );
}
