import React from 'react';
import { CHART_COLORS } from '../../lib/constants';

export function LineChart({ data, series, height = 180 }) {
    if (!data || data.length < 2) return null;

    const W = 600, H = height;
    const pad = { t: 12, r: 16, b: 28, l: 44 };
    const innerW = W - pad.l - pad.r;
    const innerH = H - pad.t - pad.b;

    const timestamps = data.map(row => row[0]);
    const tMin = timestamps[0];
    const tRange = timestamps[timestamps.length - 1] - tMin || 1;

    const allValues = series.flatMap(idx => data.map(row => row[idx]));
    const vMin = Math.min(...allValues);
    const vMax = Math.max(...allValues);
    const vRange = vMax - vMin || 1;

    const scaleX = v => pad.l + ((v - tMin) / tRange) * innerW;
    const scaleY = v => pad.t + (1 - (v - vMin) / vRange) * innerH;

    const yTicks = 4;
    const xTicks = 5;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }}>
            {Array.from({ length: yTicks + 1 }, (_, i) => {
                const y = pad.t + (i / yTicks) * innerH;
                const v = vMax - (i / yTicks) * vRange;
                return (
                    <g key={i}>
                        <line x1={pad.l} y1={y} x2={pad.l + innerW} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                        <text x={pad.l - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
                            {v.toFixed(2)}
                        </text>
                    </g>
                );
            })}
            {Array.from({ length: xTicks + 1 }, (_, i) => {
                const x = pad.l + (i / xTicks) * innerW;
                const v = tMin + (i / xTicks) * tRange;
                return (
                    <text key={i} x={x} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">
                        {v.toFixed(1)}s
                    </text>
                );
            })}
            {series.map((seriesIdx, paletteIdx) => {
                const points = data.map(row => `${scaleX(row[0])},${scaleY(row[seriesIdx])}`).join(' L ');
                return (
                    <path key={seriesIdx} d={`M ${points}`} fill="none"
                        stroke={CHART_COLORS[paletteIdx % CHART_COLORS.length]} strokeWidth="1.5" />
                );
            })}
        </svg>
    );
}
