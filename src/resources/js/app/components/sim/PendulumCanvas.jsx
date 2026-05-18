import React, { useEffect, useRef } from 'react';

const CANVAS_W = 420;
const CANVAS_H = 260;
const PIXELS_PER_METER = 55;
const TRACK_Y_FRACTION = 0.68;
const TRACK_MARGIN_X = 20;
const TRACK_LINE_WIDTH = 2;
const CART_WIDTH = 58;
const CART_HEIGHT = 28;
const CART_CORNER_RADIUS = 4;
const WHEEL_OFFSET_X = 16;
const WHEEL_OFFSET_Y = 6;
const WHEEL_RADIUS = 7;
const WHEEL_HUB_RADIUS = 2.5;
const ROD_LENGTH = 90;
const ROD_LINE_WIDTH = 3;
const BOB_RADIUS = 9;
const INFO_FONT = '11px monospace';
const INFO_TEXT_X = 8;
const INFO_TEXT_Y = 16;

export function PendulumCanvas({ frames, idx }) {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas || !frames?.length) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const [time, cartPos, , theta] = frames[Math.min(idx, frames.length - 1)];

        ctx.clearRect(0, 0, W, H);

        const trackY = H * TRACK_Y_FRACTION;
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = TRACK_LINE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(TRACK_MARGIN_X, trackY);
        ctx.lineTo(W - TRACK_MARGIN_X, trackY);
        ctx.stroke();

        const cartX = W / 2 + cartPos * PIXELS_PER_METER;
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.roundRect(cartX - CART_WIDTH / 2, trackY - CART_HEIGHT, CART_WIDTH, CART_HEIGHT, CART_CORNER_RADIUS);
        ctx.fill();

        const wheels = [
            [cartX - WHEEL_OFFSET_X, trackY + WHEEL_OFFSET_Y],
            [cartX + WHEEL_OFFSET_X, trackY + WHEEL_OFFSET_Y],
        ];
        wheels.forEach(([wx, wy]) => {
            ctx.fillStyle = '#1e40af';
            ctx.beginPath();
            ctx.arc(wx, wy, WHEEL_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#dbeafe';
            ctx.beginPath();
            ctx.arc(wx, wy, WHEEL_HUB_RADIUS, 0, Math.PI * 2);
            ctx.fill();
        });

        const pivotX = cartX, pivotY = trackY - CART_HEIGHT;
        const tipX = pivotX + ROD_LENGTH * Math.sin(theta);
        const tipY = pivotY - ROD_LENGTH * Math.cos(theta);
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = ROD_LINE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(tipX, tipY, BOB_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#6b7280';
        ctx.font = INFO_FONT;
        ctx.fillText(
            `t=${time.toFixed(2)}s  x=${cartPos.toFixed(3)}m  θ=${(theta * 180 / Math.PI).toFixed(1)}°`,
            INFO_TEXT_X, INFO_TEXT_Y
        );
    }, [frames, idx]);

    return (
        <canvas ref={ref} width={CANVAS_W} height={CANVAS_H}
            style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' }} />
    );
}
