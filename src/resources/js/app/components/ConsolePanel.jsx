import React, { useState } from 'react';
import _Editor from 'react-simple-code-editor';
const Editor = _Editor.default || _Editor;
import Prism from 'prismjs';
import 'prismjs/components/prism-matlab';
import 'prismjs/themes/prism-tomorrow.css';
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
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-API-Key': apiKey,
                },
                body: JSON.stringify({ command, session_token: session || undefined }),
            });
            const json = await res.json();
            if (json.session_token) {
                localStorage.setItem(STORAGE_KEYS.session, json.session_token);
                setSession(json.session_token);
            }
            const resultLine = json.success
                ? (json.output || '(no output)')
                : json.error
                    ? `${t.consolePanel.error_prefix} ${json.error}`
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

    const runDisabled = loading || !apiKey || !command.trim();

    return (
        <div className="max-w-[860px]">
            <div className="flex gap-2 items-center mb-2.5 flex-wrap">
                <span className="text-xs text-gray-400">
                    {t.session}: <code className="text-[11px] bg-gray-100 px-1 py-px rounded-[3px]">
                        {session ? session.slice(0, 20) + '…' : '(none)'}
                    </code>
                </span>
                <button onClick={newSession}
                    className="text-xs px-2.5 py-0.5 border border-gray-300 rounded cursor-pointer bg-white">
                    {t.newSession}
                </button>
            </div>

            {!apiKey && (
                <div className="px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-[7px] text-amber-800 text-[13px] mb-2.5">
                    ⚠ {t.noApiKey}
                </div>
            )}

            <Editor
                value={command}
                onValueChange={setCommand}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) execute(); }}
                highlight={code => Prism.highlight(code, Prism.languages.matlab, 'matlab')}
                placeholder={t.commandHint + '\n\nExample:\na = 1 + 1\na + 2'}
                padding={12}
                style={{
                    fontFamily: 'monospace',
                    fontSize: 13,
                    minHeight: 130,
                    backgroundColor: '#1e1e2e',
                    color: '#cdd6f4',
                    borderRadius: '7px',
                    border: '1px solid #374151',
                    width: '100%',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    overflow: 'auto',
                }}
                textareaClassName="outline-none"
            />

            <div className="flex gap-2 my-2 flex-wrap">
                <button onClick={execute} disabled={runDisabled}
                    className={`px-6 py-2 text-white border-0 rounded-[7px] font-semibold ${runDisabled ? 'bg-gray-400 cursor-default' : 'bg-blue-500 cursor-pointer'}`}>
                    {loading ? t.loading : t.execute}
                </button>
                <button onClick={() => setOutput('')}
                    className="px-4 py-2 border border-gray-300 rounded-[7px] cursor-pointer bg-white">
                    {t.clearOutput}
                </button>
            </div>

            <pre className="bg-[#1e1e2e] text-[#cdd6f4] p-4 rounded-[7px] min-h-[220px] font-mono text-[13px] overflow-x-auto whitespace-pre-wrap break-words m-0">
                {output || t.consolePanel.placeholder}
            </pre>
        </div>
    );
}
