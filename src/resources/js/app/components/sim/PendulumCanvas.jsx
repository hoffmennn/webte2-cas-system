import React from 'react';
import {
    CANVAS_W, CANVAS_H, CANVAS_STYLE,
    INFO_FONT, INFO_TEXT_X, INFO_TEXT_Y,
    useCanvas2D,
} from './canvasShared';

const PIXELS_PER_METER = 55;
const TRACK_Y_FRACTION = 0.68;
const TRACK_MARGIN_X = 20;
const TRACK_LINE_WIDTH = 2;
const CART_WIDTH = 60;
const CART_HEIGHT = 30;
const CART_CORNER_RADIUS = 5;
const WHEEL_OFFSET_X = 17;
const WHEEL_OFFSET_Y = 7;
const WHEEL_RADIUS = 8;
const WHEEL_HUB_RADIUS = 2.5;
const ROD_LENGTH = 92;
const ROD_LINE_WIDTH = 4;
const BOB_RADIUS = 11;

export function PendulumCanvas({ frames, idx }) {
    const ref = useCanvas2D(frames, idx, (ctx, frame, W, H) => {
        const [time, cartPos, , theta] = frame;

        const trackY = H * TRACK_Y_FRACTION;

        /* ─── track (with subtle shadow underneath) ─── */
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.15)';
        ctx.lineWidth = TRACK_LINE_WIDTH + 1;
        ctx.beginPath();
        ctx.moveTo(TRACK_MARGIN_X, trackY + 2);
        ctx.lineTo(W - TRACK_MARGIN_X, trackY + 2);
        ctx.stroke();

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = TRACK_LINE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(TRACK_MARGIN_X, trackY);
        ctx.lineTo(W - TRACK_MARGIN_X, trackY);
        ctx.stroke();

        // tiny end caps that suggest the rails terminate
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        [TRACK_MARGIN_X, W - TRACK_MARGIN_X].forEach(x => {
            ctx.beginPath();
            ctx.moveTo(x, trackY - 4);
            ctx.lineTo(x, trackY + 4);
            ctx.stroke();
        });

        const cartX = W / 2 + cartPos * PIXELS_PER_METER;

        /* ─── cart with vertical gradient ─── */
        const cartTop = trackY - CART_HEIGHT;
        const cartGradient = ctx.createLinearGradient(cartX, cartTop, cartX, trackY);
        cartGradient.addColorStop(0,   '#60a5fa');
        cartGradient.addColorStop(0.5, '#3b82f6');
        cartGradient.addColorStop(1,   '#1e40af');
        ctx.fillStyle = cartGradient;
        ctx.beginPath();
        ctx.roundRect(cartX - CART_WIDTH / 2, cartTop, CART_WIDTH, CART_HEIGHT, CART_CORNER_RADIUS);
        ctx.fill();
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 1;
        ctx.stroke();

        // cart highlight strip across the top
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cartX - CART_WIDTH / 2 + 6, cartTop + 4);
        ctx.lineTo(cartX + CART_WIDTH / 2 - 6, cartTop + 4);
        ctx.stroke();

        /* ─── wheels ─── */
        const wheels = [
            [cartX - WHEEL_OFFSET_X, trackY + WHEEL_OFFSET_Y],
            [cartX + WHEEL_OFFSET_X, trackY + WHEEL_OFFSET_Y],
        ];
        wheels.forEach(([wx, wy]) => {
            const wheelGradient = ctx.createRadialGradient(wx - 2, wy - 2, 1, wx, wy, WHEEL_RADIUS);
            wheelGradient.addColorStop(0, '#3b82f6');
            wheelGradient.addColorStop(1, '#1e3a8a');
            ctx.fillStyle = wheelGradient;
            ctx.beginPath();
            ctx.arc(wx, wy, WHEEL_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#1e3a8a';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = '#dbeafe';
            ctx.beginPath();
            ctx.arc(wx, wy, WHEEL_HUB_RADIUS, 0, Math.PI * 2);
            ctx.fill();
        });

        /* ─── rod ─── */
        const pivotX = cartX, pivotY = trackY - CART_HEIGHT;
        const tipX = pivotX + ROD_LENGTH * Math.sin(theta);
        const tipY = pivotY - ROD_LENGTH * Math.cos(theta);

        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = ROD_LINE_WIDTH;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        // rod highlight (thin line along the rod, slightly offset)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = ROD_LINE_WIDTH - 2;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        /* ─── pivot hinge on top of the cart ─── */
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, 1.5, 0, Math.PI * 2);
        ctx.fill();

        /* ─── bob with radial gradient ─── */
        const bobGradient = ctx.createRadialGradient(
            tipX - BOB_RADIUS * 0.35, tipY - BOB_RADIUS * 0.35, 1,
            tipX, tipY, BOB_RADIUS
        );
        bobGradient.addColorStop(0,   '#fecaca');
        bobGradient.addColorStop(0.55,'#ef4444');
        bobGradient.addColorStop(1,   '#7f1d1d');
        ctx.fillStyle = bobGradient;
        ctx.beginPath();
        ctx.arc(tipX, tipY, BOB_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        /* ─── readout ─── */
        ctx.fillStyle = '#6b7280';
        ctx.font = INFO_FONT;
        ctx.fillText(
            `t=${time.toFixed(2)}s  x=${cartPos.toFixed(3)}m  θ=${(theta * 180 / Math.PI).toFixed(1)}°`,
            INFO_TEXT_X, INFO_TEXT_Y
        );
    });

    return <canvas ref={ref} width={CANVAS_W} height={CANVAS_H} style={CANVAS_STYLE} />;
}
