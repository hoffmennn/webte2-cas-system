import React, { useState } from 'react';
import { API_BASE, STORAGE_KEYS } from '../lib/constants';

export function ConsolePanel({ apiKey, t }) {
    const [command, setCommand] = useState('');
    const [output, setOutput] = useState('');
    const [session, setSession] = useState(() => localStorage.getItem(STORAGE_KEYS.session) || '');
    const [loading, setLoading] = useState(false);

    const execute = async () => {
        if (!command.trim() || !apiKey) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
                body: JSON.stringify({ command, session_token: session || undefined }),
            });
            const json = await res.json();
            if (json.session_token) {
                localStorage.setItem(STORAGE_KEYS.session, json.session_token);
                setSession(json.session_token);
            }
            const resultLine = json.success
                ? (json.output || '(no output)')
                : t.consolePanel.error_prefix;
            setOutput(prev => prev + `>> ${command}\n${resultLine}\n\n`);
        } catch {
            setOutput(prev => prev + `>> ${command}\n${t.consolePanel.error_prefix}\n\n`);
        } finally {
            setLoading(false);
        }
    };

    const newSession = () => {
        localStorage.removeItem(STORAGE_KEYS.session);
        setSession('');
        setOutput('');
    };

    return (
        <div style={{ maxWidth: 860 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>
                    {t.session}: <code style={{ fontSize: 11, background: '#f3f4f6', padding: '1px 4px', borderRadius: 3 }}>
                        {session ? session.slice(0, 20) + '…' : '(none)'}
                    </code>
                </span>
                <button onClick={newSession}
                    style={{ fontSize: 12, padding: '2px 10px', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', background: '#fff' }}>
                    {t.newSession}
                </button>
            </div>

            {!apiKey && (
                <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 7, color: '#92400e', fontSize: 13, marginBottom: 10 }}>
                    ⚠ {t.noApiKey}
                </div>
            )}

            <textarea value={command} onChange={e => setCommand(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) execute(); }}
                placeholder={t.commandHint + '\n\nExample:\na = 1 + 1\na + 2'}
                style={{ width: '100%', minHeight: 130, padding: 12, fontFamily: 'monospace', fontSize: 13, border: '1px solid #374151', borderRadius: 7, resize: 'vertical', background: '#1e1e2e', color: '#cdd6f4', boxSizing: 'border-box', outline: 'none' }}
            />

            <div style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
                <button onClick={execute} disabled={loading || !apiKey || !command.trim()}
                    style={{ padding: '8px 24px', background: loading || !apiKey || !command.trim() ? '#9ca3af' : '#3b82f6', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', fontWeight: 600 }}>
                    {loading ? t.loading : t.execute}
                </button>
                <button onClick={() => setOutput('')}
                    style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 7, cursor: 'pointer', background: '#fff' }}>
                    {t.clearOutput}
                </button>
            </div>

            <pre style={{ background: '#1e1e2e', color: '#cdd6f4', padding: 16, borderRadius: 7, minHeight: 220, fontFamily: 'monospace', fontSize: 13, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                {output || t.consolePanel.placeholder}
            </pre>
        </div>
    );
}
