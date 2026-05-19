import React, { useEffect, useRef, useState } from 'react';
import { API_BASE } from '../lib/constants';

export function Header({ lang, setLang, apiKey, keyStatus, onSaveApiKey, t, tabs, activeTab, onTabSelect }) {
    const [draft, setDraft] = useState(apiKey);
    const [menuOpen, setMenuOpen] = useState(false);
    const headerRef = useRef(null);

    // Re-sync the draft if the saved key changes from outside the header
    // (e.g. on first load from localStorage, or future programmatic resets).
    useEffect(() => { setDraft(apiKey); }, [apiKey]);

    // Dismiss the mobile dropdown on outside click or Escape.
    useEffect(() => {
        if (!menuOpen) return;
        const onPointer = (e) => {
            if (!headerRef.current?.contains(e.target)) setMenuOpen(false);
        };
        const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
        document.addEventListener('pointerdown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [menuOpen]);

    const isDirty = draft !== apiKey;
    const save = () => onSaveApiKey(draft);

    const selectTab = (key) => {
        onTabSelect(key);
        setMenuOpen(false);
    };

    return (
        <header ref={headerRef} className="bg-white border-b border-slate-200 relative">
            <div className="px-4 md:px-6 py-2 flex items-center justify-between gap-3 min-h-[56px]">
                <h1 className="m-0 text-lg font-bold text-slate-900 tracking-[-0.02em]">
                    {t.title}
                </h1>

                {/* Mobile: lang toggle stays inline, everything else hides behind the burger. */}
                <div className="md:hidden flex items-center gap-2">
                    <LangToggle lang={lang} setLang={setLang} />
                    <MobileMenuButton open={menuOpen} onClick={() => setMenuOpen(o => !o)} />
                </div>

                {/* Desktop: full action row inline. */}
                <div className="hidden md:flex items-center gap-3 flex-wrap">
                    <ApiKeyInput
                        draft={draft} setDraft={setDraft} onSave={save}
                        isDirty={isDirty}
                        placeholder={t.header.api_key_placeholder}
                        saveLabel={t.save}
                        unsavedLabel={t.header.unsaved} />
                    <ExportLogsButton apiKey={apiKey} label={t.header.export_logs} />
                    <KeyStatusBadge status={keyStatus} t={t} />
                    <LangToggle lang={lang} setLang={setLang} />
                </div>
            </div>

            {/* Mobile dropdown floats over content; max-h transition animates open/close. */}
            <div
                className={`md:hidden absolute left-0 right-0 top-full bg-white border-b border-slate-200 shadow-lg overflow-hidden transition-[max-height] duration-300 ease-in-out z-20 ${menuOpen ? 'max-h-[600px]' : 'max-h-0'}`}
                aria-hidden={!menuOpen}>
                <div className="px-4 py-3 flex flex-col gap-3">
                    <nav className="flex flex-col gap-0.5">
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.key;
                            return (
                                <button key={tab.key} onClick={() => selectTab(tab.key)}
                                    className={`text-left py-2 px-3 rounded-md text-sm border-0 cursor-pointer ${isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'bg-white text-slate-700'}`}>
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                    <div className="border-t border-slate-200 pt-3 flex flex-col gap-2.5">
                        <ApiKeyInput
                            draft={draft} setDraft={setDraft} onSave={save}
                            isDirty={isDirty}
                            placeholder={t.header.api_key_placeholder}
                            saveLabel={t.save}
                            unsavedLabel={t.header.unsaved} />
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <ExportLogsButton apiKey={apiKey} label={t.header.export_logs} />
                            <KeyStatusBadge status={keyStatus} t={t} />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

function MobileMenuButton({ open, onClick }) {
    return (
        <button onClick={onClick} aria-label="Menu" aria-expanded={open}
            className="p-1.5 border border-slate-200 rounded-md bg-white cursor-pointer text-slate-700">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {open ? (
                    <>
                        <line x1="5" y1="5" x2="17" y2="17" />
                        <line x1="17" y1="5" x2="5" y2="17" />
                    </>
                ) : (
                    <>
                        <line x1="4" y1="7" x2="18" y2="7" />
                        <line x1="4" y1="11" x2="18" y2="11" />
                        <line x1="4" y1="15" x2="18" y2="15" />
                    </>
                )}
            </svg>
        </button>
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
    // Click anywhere on the toggle flips to the other language — clicking the
    // active button is not a no-op, it's the same as clicking the inactive one.
    const flip = () => setLang(lang === 'en' ? 'sk' : 'en');
    return (
        <div className="flex border border-slate-200 rounded-md overflow-hidden">
            {['en', 'sk'].map(l => (
                <button key={l} onClick={flip}
                    className={`min-w-[44px] py-1 px-3 border-0 cursor-pointer text-xs text-center ${lang === l ? 'bg-slate-900 text-white font-semibold' : 'bg-white text-slate-500 font-normal'}`}>
                    {l.toUpperCase()}
                </button>
            ))}
        </div>
    );
}

function ApiKeyInput({ draft, setDraft, onSave, isDirty, placeholder, saveLabel, unsavedLabel }) {
    return (
        <div className="flex gap-1.5 items-center relative w-full md:w-auto">
            <input type="password" placeholder={placeholder} value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSave()}
                title={isDirty ? unsavedLabel : ''}
                className={`px-2.5 py-[5px] border rounded-md text-[13px] flex-1 md:flex-none md:w-[190px] max-w-full outline-none ${isDirty ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`} />
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
