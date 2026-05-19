import { useEffect, useRef } from 'react';

export const CANVAS_W = 420;
export const CANVAS_H = 260;
export const INFO_FONT = '11px monospace';
export const INFO_TEXT_X = 8;
export const INFO_TEXT_Y = 16;

export const CANVAS_STYLE = {
    width: '100%',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    background: '#f8fafc',
};

/**
 * Wires a 2D canvas ref to a draw callback that runs on every (frames, idx)
 * change. The callback receives an already-cleared ctx, the current frame
 * array, and canvas dimensions. `draw` is read through a ref so callers
 * don't need to memoize it.
 */
export function useCanvas2D(frames, idx, draw) {
    const ref = useRef(null);
    const drawRef = useRef(draw);
    drawRef.current = draw;

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas || !frames?.length) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        const frame = frames[Math.min(idx, frames.length - 1)];

        ctx.clearRect(0, 0, W, H);
        drawRef.current(ctx, frame, W, H);
    }, [frames, idx]);

    return ref;
}
