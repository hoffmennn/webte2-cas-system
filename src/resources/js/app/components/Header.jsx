import React, { useState } from 'react';

export function Header({ lang, setLang, apiKey, onSaveApiKey, t }) {
    const [draft, setDraft] = useState(apiKey);

    const save = () => onSaveApiKey(draft);

    return (
        <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
                {t.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <LangToggle lang={lang} setLang={setLang} />
                <ApiKeyInput draft={draft} setDraft={setDraft} onSave={save} placeholder={t.apiKey} saveLabel={t.save} />
                {apiKey && <ReadyBadge label={t.readyLabel} />}
            </div>
        </header>
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

function ApiKeyInput({ draft, setDraft, onSave, placeholder, saveLabel }) {
    return (
        <div style={{ display: 'flex', gap: 6 }}>
            <input type="password" placeholder={placeholder} value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSave()}
                style={{ padding: '5px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, width: 190 }} />
            <button onClick={onSave}
                style={{ padding: '5px 14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {saveLabel}
            </button>
        </div>
    );
}

function ReadyBadge({ label }) {
    return (
        <span style={{ fontSize: 12, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 7, height: 7, background: '#16a34a', borderRadius: '50%', display: 'inline-block' }} />
            {label}
        </span>
    );
}
