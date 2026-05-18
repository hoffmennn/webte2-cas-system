import React, { useEffect, useState } from 'react';
import { API_BASE } from '../lib/constants';

export function Header({ lang, setLang, apiKey, keyStatus, onSaveApiKey, t }) {
    const [draft, setDraft] = useState(apiKey);

    // Re-sync the draft if the saved key changes from outside the header
    // (e.g. on first load from localStorage, or future programmatic resets).
    useEffect(() => { setDraft(apiKey); }, [apiKey]);

    const isDirty = draft !== apiKey;
    const save = () => onSaveApiKey(draft);

    return (
        <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {t.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <LangToggle lang={lang} setLang={setLang} />
                <ApiKeyInput
                    draft={draft}
                    setDraft={setDraft}
                    onSave={save}
                    isDirty={isDirty}
                    placeholder={t.header.api_key_placeholder}
                    saveLabel={t.save}
                    unsavedLabel={t.header.unsaved}
                />
                <ExportLogsButton apiKey={apiKey} label={t.header.export_logs} />
                <KeyStatusBadge status={keyStatus} t={t} />
            </div>
        </header>
    );
}

async function downloadLogsCsv(apiKey) {
    const response = await fetch(`${API_BASE}/logs/export`, {
        headers: { 'X-API-Key': apiKey },
    });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    const blob = await response.blob();
    const filenameFromHeader = (response.headers.get('Content-Disposition') || '')
        .match(/filename="?([^"]+)"?/)?.[1];
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filenameFromHeader || 'cas_logs.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function ExportLogsButton({ apiKey, label }) {
    const disabled = !apiKey;
    return (
        <button
            onClick={() => downloadLogsCsv(apiKey).catch(err => console.error(err))}
            disabled={disabled}
            style={{ padding: '5px 12px', background: disabled ? '#e5e7eb' : '#fff', color: disabled ? '#9ca3af' : '#0f172a', border: '1px solid #e2e8f0', borderRadius: 6, cursor: disabled ? 'default' : 'pointer', fontSize: 12, fontWeight: 500 }}>
            {label}
        </button>
    );
}

function LangToggle({ lang, setLang }) {
    return (
        <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
            {['en', 'sk'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                    style={{ padding: '4px 12px', border: 'none', cursor: 'pointer', background: lang === l ? '#0f172a' : '#fff', color: lang === l ? '#fff' : '#64748b', fontWeight: lang === l ? 600 : 400, fontSize: 12 }}>
                    {l.toUpperCase()}
                </button>
            ))}
        </div>
    );
}

function ApiKeyInput({ draft, setDraft, onSave, isDirty, placeholder, saveLabel, unsavedLabel }) {
    const borderColor = isDirty ? '#f59e0b' : '#e2e8f0';
    const buttonBg    = isDirty ? '#f59e0b' : '#0f172a';

    return (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', position: 'relative' }}>
            <input type="password" placeholder={placeholder} value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSave()}
                title={isDirty ? unsavedLabel : ''}
                style={{ padding: '5px 10px', border: `1px solid ${borderColor}`, background: isDirty ? '#fffbeb' : '#fff', borderRadius: 6, fontSize: 13, width: 190 }} />
            {isDirty && (
                <span style={{ position: 'absolute', left: 6, top: -8, fontSize: 10, fontWeight: 600, color: '#b45309', background: '#fffbeb', padding: '0 4px' }}>
                    {unsavedLabel}
                </span>
            )}
            <button onClick={onSave}
                style={{ padding: '5px 14px', background: buttonBg, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {saveLabel}
            </button>
        </div>
    );
}

const BADGE_STYLES = {
    valid:    { color: '#16a34a', dot: '#16a34a' }, // green
    checking: { color: '#ca8a04', dot: '#eab308' }, // amber, pulsing
    invalid:  { color: '#dc2626', dot: '#dc2626' }, // red
};

function KeyStatusBadge({ status, t }) {
    if (status === 'idle') return null;
    const { color, dot } = BADGE_STYLES[status];
    const label = status === 'valid'    ? t.readyLabel
                : status === 'checking' ? t.checkingLabel
                : t.invalidKeyLabel;

    return (
        <span style={{ fontSize: 12, color, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
                width: 7, height: 7, background: dot, borderRadius: '50%', display: 'inline-block',
                animation: status === 'checking' ? 'cas-pulse 1s ease-in-out infinite' : 'none',
            }} />
            {label}
        </span>
    );
}
