import React, { useState } from 'react';
import { API_BASE, CHART_COLORS, SERIES_LABELS } from '../../lib/constants';
import { usePlayer } from '../../hooks/usePlayer';
import { LineChart } from './LineChart';
import { PendulumCanvas } from './PendulumCanvas';
import { BallBeamCanvas } from './BallBeamCanvas';

const PENDULUM_PARAMS = [
    { key: 'M',      label: 'Cart mass M (kg)',       default: 0.5,   step: 0.1 },
    { key: 'm',      label: 'Pendulum mass m (kg)',   default: 0.2,   step: 0.05 },
    { key: 'b',      label: 'Friction b',             default: 0.1,   step: 0.01 },
    { key: 'I',      label: 'Inertia I',              default: 0.006, step: 0.001 },
    { key: 'l',      label: 'Rod length l (m)',       default: 0.3,   step: 0.05 },
    { key: 'theta0', label: 'Initial angle θ₀ (rad)', default: 0.1,   step: 0.01 },
    { key: 'dt',     label: 'Time step dt (s)',       default: 0.05,  step: 0.01 },
    { key: 'tmax',   label: 'Duration tmax (s)',      default: 5,     step: 1 },
];

const BALLBEAM_PARAMS = [
    { key: 'm',    label: 'Ball mass m (kg)',        default: 0.111,   step: 0.01 },
    { key: 'R',    label: 'Ball radius R (m)',       default: 0.015,   step: 0.001 },
    { key: 'J',    label: 'Inertia J',               default: 9.99e-6, step: 1e-6 },
    { key: 'r0',   label: 'Initial position r₀ (m)', default: 0.0,     step: 0.05 },
    { key: 'dt',   label: 'Time step dt (s)',        default: 0.05,    step: 0.01 },
    { key: 'tmax', label: 'Duration tmax (s)',       default: 5,       step: 1 },
];

const PARAM_DEFS = {
    'inverted-pendulum': PENDULUM_PARAMS,
    'ball-beam':         BALLBEAM_PARAMS,
};

export function SimPanel({ type, apiKey, t }) {
    const paramDefs = PARAM_DEFS[type];
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
        setLoading(true);
        setError(null);
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
    const Canvas = type === 'inverted-pendulum' ? PendulumCanvas : BallBeamCanvas;
    const runDisabled = loading || !apiKey;

    return (
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 items-start">
            {/* ─── Params ─── */}
            <div className="bg-white border border-gray-200 rounded-[10px] p-4">
                <h3 className="mt-0 mb-3 font-semibold text-sm">{t.params}</h3>
                {paramDefs.map(p => (
                    <div key={p.key} className="mb-2.5">
                        <label className="block text-[11px] text-gray-500 mb-[3px]">{p.label}</label>
                        <input type="number" value={params[p.key]} step={p.step}
                            onChange={e => setParams(prev => ({ ...prev, [p.key]: parseFloat(e.target.value) || 0 }))}
                            className="w-full py-[5px] px-2 border border-gray-300 rounded-[5px] text-[13px] box-border" />
                    </div>
                ))}
                <button onClick={run} disabled={runDisabled}
                    className={`w-full py-[9px] text-white border-0 rounded-[7px] font-semibold mt-1 ${runDisabled ? 'bg-gray-400 cursor-default' : 'bg-blue-500 cursor-pointer'}`}>
                    {loading ? t.loading : t.run}
                </button>
                {!apiKey && <p className="text-amber-500 text-xs mt-2 mb-0">{t.sim.need_api_key}</p>}
                {error && (
                    <div className="mt-2.5 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs">
                        {error}
                    </div>
                )}
            </div>

            {/* ─── Output ─── */}
            <div>
                {frames ? (
                    <>
                        <Canvas frames={frames} idx={idx} />

                        {/* Playback */}
                        <div className="flex items-center gap-2 my-2">
                            <button onClick={() => setPlaying(p => !p)}
                                className="py-1 px-3.5 border border-gray-300 rounded-[5px] cursor-pointer bg-white text-base">
                                {playing ? '⏸' : '▶'}
                            </button>
                            <button onClick={() => { setIdx(0); setPlaying(false); }}
                                className="py-1 px-3.5 border border-gray-300 rounded-[5px] cursor-pointer bg-white text-base">
                                ⏮
                            </button>
                            <input type="range" min={0} max={frames.length - 1} value={idx}
                                onChange={e => { setPlaying(false); setIdx(+e.target.value); }}
                                className="flex-1" />
                            <span className="text-xs text-gray-400 whitespace-nowrap">{idx + 1}/{frames.length}</span>
                        </div>

                        {/* Series selector */}
                        <div className="flex gap-3.5 mb-2 flex-wrap">
                            {[1, 2, 3, 4].map((seriesIdx, paletteIdx) => (
                                <label key={seriesIdx} className="text-xs cursor-pointer flex items-center gap-[5px]">
                                    <input type="checkbox" checked={series.includes(seriesIdx)}
                                        onChange={e => setSeries(prev => e.target.checked ? [...prev, seriesIdx] : prev.filter(s => s !== seriesIdx))} />
                                    <span style={{ color: CHART_COLORS[paletteIdx] }}>{labels[seriesIdx]}</span>
                                </label>
                            ))}
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg pt-2 px-2 pb-1">
                            <LineChart data={frames} series={[...series].sort()} height={180} idx={idx} />
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-80 border-2 border-dashed border-gray-200 rounded-[10px] text-gray-400 flex-col gap-2">
                        <span className="text-[32px]">▶</span>
                        <span className="text-sm">{t.sim.empty_hint}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
