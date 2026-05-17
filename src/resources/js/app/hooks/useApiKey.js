import { useEffect, useState } from 'react';
import { API_BASE, STORAGE_KEYS } from '../lib/constants';

// 'idle'     – no key entered yet
// 'checking' – ping request in flight
// 'valid'    – /ping returned 2xx
// 'invalid'  – /ping returned 4xx/5xx or network failed
export function useApiKey() {
    const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEYS.apiKey) || '');
    const [status, setStatus] = useState('idle');

    useEffect(() => {
        if (!apiKey) {
            setStatus('idle');
            return;
        }
        setStatus('checking');
        const controller = new AbortController();
        fetch(`${API_BASE}/ping`, {
            headers: { 'X-API-Key': apiKey },
            signal: controller.signal,
        })
            .then(res => setStatus(res.ok ? 'valid' : 'invalid'))
            .catch(err => {
                if (err.name !== 'AbortError') setStatus('invalid');
            });
        return () => controller.abort();
    }, [apiKey]);

    const save = key => {
        localStorage.setItem(STORAGE_KEYS.apiKey, key);
        setApiKey(key);
    };

    return { apiKey, status, save };
}
