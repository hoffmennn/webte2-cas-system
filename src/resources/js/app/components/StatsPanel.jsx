import React, { useEffect, useState } from 'react';
import { API_BASE } from '../lib/constants';

const TABLE_CLASS = 'w-full border-collapse text-[13px] bg-white border border-gray-200 rounded-lg overflow-hidden';
const TH_CLASS    = 'text-left px-2.5 py-2 border-b border-gray-200 bg-slate-50 font-semibold text-slate-900';
const TD_CLASS    = 'px-2.5 py-2 border-b border-slate-100 text-slate-700';
const SECTION_TITLE_CLASS = 'mt-4 mb-2 text-sm font-semibold text-slate-900';

function animationLabel(type, t) {
    if (type === 'inverted_pendulum') return t.pendulum;
    if (type === 'ball_beam')         return t.ballBeam;
    return type;
}

export function StatsPanel({ apiKey, t }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState(null);

    useEffect(() => {
        if (!apiKey) return;
        let cancelled = false;
        fetch(`${API_BASE}/stats`, { headers: { 'X-API-Key': apiKey } })
            .then(res => res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`)))
            .then(json => { if (!cancelled) setData(json); })
            .catch(err => { if (!cancelled) setError(err.message); });
        return () => { cancelled = true; };
    }, [apiKey]);

    if (!apiKey) {
        return (
            <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[13px]">
                {t.sim.need_api_key}
            </div>
        );
    }

    if (error) {
        return <p className="text-red-600 text-[13px]">{error}</p>;
    }

    if (!data) {
        return <p className="text-gray-400 text-[13px]">{t.loading}</p>;
    }

    const isEmpty = data.summary.length === 0 && data.details.length === 0;
    if (isEmpty) {
        return <p className="text-gray-400 text-[13px]">{t.stats.empty}</p>;
    }

    const filteredDetails = selectedType
        ? data.details.filter(row => row.animation_type === selectedType)
        : data.details;

    return (
        <div className="max-w-[980px]">
            <h3 className={SECTION_TITLE_CLASS}>{t.stats.section_summary}</h3>
            <SummaryTable
                rows={data.summary}
                selectedType={selectedType}
                onSelect={setSelectedType}
                t={t}
            />

            <h3 className={SECTION_TITLE_CLASS}>{t.stats.section_details}</h3>
            <DetailsTable rows={filteredDetails} t={t} />

            {selectedType && (
                <button
                    onClick={() => setSelectedType(null)}
                    className="mt-2 px-2.5 py-1 bg-white border border-gray-300 rounded-md cursor-pointer text-xs text-slate-900">
                    {t.stats.clear_filter}
                </button>
            )}
        </div>
    );
}

function SummaryTable({ rows, selectedType, onSelect, t }) {
    return (
        <div className="overflow-x-auto">
            <table className={TABLE_CLASS}>
                <thead>
                    <tr>
                        <th className={TH_CLASS}>{t.stats.col_animation}</th>
                        <th className={TH_CLASS}>{t.stats.col_runs}</th>
                        <th className={TH_CLASS}>{t.stats.col_visitors}</th>
                        <th className={TH_CLASS}>{t.stats.col_last_used}</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(row => {
                        const active = row.animation_type === selectedType;
                        return (
                            <tr key={row.animation_type}
                                onClick={() => onSelect(active ? null : row.animation_type)}
                                className={`cursor-pointer ${active ? 'bg-blue-50' : 'bg-transparent'}`}>
                                <td className={TD_CLASS}>{animationLabel(row.animation_type, t)}</td>
                                <td className={TD_CLASS}>{row.total_runs}</td>
                                <td className={TD_CLASS}>{row.unique_visitors}</td>
                                <td className={TD_CLASS}>{formatTimestamp(row.last_used_at)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function DetailsTable({ rows, t }) {
    return (
        <div className="overflow-x-auto">
            <table className={TABLE_CLASS}>
                <thead>
                    <tr>
                        <th className={TH_CLASS}>{t.stats.col_animation}</th>
                        <th className={TH_CLASS}>{t.stats.col_time}</th>
                        <th className={TH_CLASS}>{t.stats.col_city}</th>
                        <th className={TH_CLASS}>{t.stats.col_country}</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i}>
                            <td className={TD_CLASS}>{animationLabel(row.animation_type, t)}</td>
                            <td className={TD_CLASS}>{formatTimestamp(row.used_at)}</td>
                            <td className={TD_CLASS}>{row.city || '—'}</td>
                            <td className={TD_CLASS}>{row.country || '—'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function formatTimestamp(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
}
