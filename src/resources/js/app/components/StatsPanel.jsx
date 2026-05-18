import React, { useEffect, useState } from 'react';
import { API_BASE } from '../lib/constants';

const TABLE_STYLE = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
};

const TH_STYLE = {
    textAlign: 'left',
    padding: '8px 10px',
    borderBottom: '1px solid #e5e7eb',
    background: '#f8fafc',
    fontWeight: 600,
    color: '#0f172a',
};

const TD_STYLE = {
    padding: '8px 10px',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
};

const SECTION_TITLE_STYLE = { margin: '16px 0 8px', fontSize: 14, fontWeight: 600, color: '#0f172a' };

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
            <div style={{ padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, color: '#92400e', fontSize: 13 }}>
                {t.sim.need_api_key}
            </div>
        );
    }

    if (error) {
        return <p style={{ color: '#dc2626', fontSize: 13 }}>{error}</p>;
    }

    if (!data) {
        return <p style={{ color: '#9ca3af', fontSize: 13 }}>{t.loading}</p>;
    }

    const isEmpty = data.summary.length === 0 && data.details.length === 0;
    if (isEmpty) {
        return <p style={{ color: '#9ca3af', fontSize: 13 }}>{t.stats.empty}</p>;
    }

    const filteredDetails = selectedType
        ? data.details.filter(row => row.animation_type === selectedType)
        : data.details;

    return (
        <div style={{ maxWidth: 980 }}>
            <h3 style={SECTION_TITLE_STYLE}>{t.stats.section_summary}</h3>
            <SummaryTable
                rows={data.summary}
                selectedType={selectedType}
                onSelect={setSelectedType}
                t={t}
            />

            <h3 style={SECTION_TITLE_STYLE}>{t.stats.section_details}</h3>
            <DetailsTable rows={filteredDetails} t={t} />

            {selectedType && (
                <button
                    onClick={() => setSelectedType(null)}
                    style={{ marginTop: 8, padding: '4px 10px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#0f172a' }}>
                    {t.stats.clear_filter}
                </button>
            )}
        </div>
    );
}

function SummaryTable({ rows, selectedType, onSelect, t }) {
    return (
        <table style={TABLE_STYLE}>
            <thead>
                <tr>
                    <th style={TH_STYLE}>{t.stats.col_animation}</th>
                    <th style={TH_STYLE}>{t.stats.col_runs}</th>
                    <th style={TH_STYLE}>{t.stats.col_visitors}</th>
                    <th style={TH_STYLE}>{t.stats.col_last_used}</th>
                </tr>
            </thead>
            <tbody>
                {rows.map(row => {
                    const active = row.animation_type === selectedType;
                    return (
                        <tr key={row.animation_type}
                            onClick={() => onSelect(active ? null : row.animation_type)}
                            style={{ cursor: 'pointer', background: active ? '#eff6ff' : 'transparent' }}>
                            <td style={TD_STYLE}>{row.animation_type}</td>
                            <td style={TD_STYLE}>{row.total_runs}</td>
                            <td style={TD_STYLE}>{row.unique_visitors}</td>
                            <td style={TD_STYLE}>{formatTimestamp(row.last_used_at)}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

function DetailsTable({ rows, t }) {
    return (
        <table style={TABLE_STYLE}>
            <thead>
                <tr>
                    <th style={TH_STYLE}>{t.stats.col_animation}</th>
                    <th style={TH_STYLE}>{t.stats.col_time}</th>
                    <th style={TH_STYLE}>{t.stats.col_city}</th>
                    <th style={TH_STYLE}>{t.stats.col_country}</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row, i) => (
                    <tr key={i}>
                        <td style={TD_STYLE}>{row.animation_type}</td>
                        <td style={TD_STYLE}>{formatTimestamp(row.used_at)}</td>
                        <td style={TD_STYLE}>{row.city || '—'}</td>
                        <td style={TD_STYLE}>{row.country || '—'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function formatTimestamp(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
}
