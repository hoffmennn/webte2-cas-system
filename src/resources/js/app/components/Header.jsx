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
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between flex-wrap gap-3 py-2 min-h-[56px]">
            <h1 className="m-0 text-lg font-bold text-slate-900 tracking-[-0.02em]">
                {t.title}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
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
            className={`px-3 py-[5px] border border-slate-200 rounded-md text-xs font-medium ${disabled ? 'bg-gray-200 text-gray-400 cursor-default' : 'bg-white text-slate-900 cursor-pointer'}`}>
            {label}
        </button>
    );
}

function LangToggle({ lang, setLang }) {
    return (
        <div className="flex border border-slate-200 rounded-md overflow-hidden">
            {['en', 'sk'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                    className={`min-w-[44px] py-1 px-3 border-0 cursor-pointer text-xs text-center ${lang === l ? 'bg-slate-900 text-white font-semibold' : 'bg-white text-slate-500 font-normal'}`}>
                    {l.toUpperCase()}
                </button>
            ))}
        </div>
    );
}

function ApiKeyInput({ draft, setDraft, onSave, isDirty, placeholder, saveLabel, unsavedLabel }) {
    return (
        <div className="flex gap-1.5 items-center relative">
            <input type="password" placeholder={placeholder} value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSave()}
                title={isDirty ? unsavedLabel : ''}
                className={`px-2.5 py-[5px] border rounded-md text-[13px] w-[190px] max-w-full outline-none ${isDirty ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`} />
            {isDirty && (
                <span className="absolute left-1.5 -top-2 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1">
                    {unsavedLabel}
                </span>
            )}
            <button onClick={onSave}
                className={`px-[14px] py-[5px] text-white border-0 rounded-md cursor-pointer text-[13px] font-semibold ${isDirty ? 'bg-amber-500' : 'bg-slate-900'}`}>
                {saveLabel}
            </button>
        </div>
    );
}

const BADGE_STYLES = {
    valid:    { textColor: 'text-green-600',  dotColor: 'bg-green-600' },
    checking: { textColor: 'text-yellow-600', dotColor: 'bg-yellow-500' },
    invalid:  { textColor: 'text-red-600',    dotColor: 'bg-red-600' },
};

function KeyStatusBadge({ status, t }) {
    if (status === 'idle') return null;
    const { textColor, dotColor } = BADGE_STYLES[status];
    const label = status === 'valid'    ? t.readyLabel
                : status === 'checking' ? t.checkingLabel
                : t.invalidKeyLabel;

    return (
        <span className={`text-xs flex items-center gap-1 ${textColor}`}>
            <span
                className={`w-[7px] h-[7px] rounded-full inline-block ${dotColor}`}
                style={{ animation: status === 'checking' ? 'cas-pulse 1s ease-in-out infinite' : 'none' }} />
            {label}
        </span>
    );
}
