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
    { key: 'd',    label: 'Gear ratio d',            default: 0.03,    step: 0.005 },
    { key: 'L',    label: 'Beam length L (m)',       default: 1.0,     step: 0.1 },
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

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>
            {/* ─── Params ─── */}
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
                {!apiKey && <p style={{ color: '#f59e0b', fontSize: 12, margin: '8px 0 0' }}>{t.sim.need_api_key}</p>}
                {error && (
                    <div style={{ marginTop: 10, padding: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#dc2626', fontSize: 12 }}>
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
                            {[1, 2, 3, 4].map((seriesIdx, paletteIdx) => (
                                <label key={seriesIdx} style={{ fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <input type="checkbox" checked={series.includes(seriesIdx)}
                                        onChange={e => setSeries(prev => e.target.checked ? [...prev, seriesIdx] : prev.filter(s => s !== seriesIdx))} />
                                    <span style={{ color: CHART_COLORS[paletteIdx] }}>{labels[seriesIdx]}</span>
                                </label>
                            ))}
                        </div>

                        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 8px 4px' }}>
                            <LineChart data={frames} series={[...series].sort()} height={180} idx={idx} />
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, border: '2px dashed #e5e7eb', borderRadius: 10, color: '#9ca3af', flexDirection: 'column', gap: 8 }}>
                        <span style={{ fontSize: 32 }}>▶</span>
                        <span style={{ fontSize: 14 }}>{t.sim.empty_hint}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
