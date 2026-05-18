import React, { useEffect, useState } from 'react';
import { TRANSLATIONS } from './lib/i18n';
import { useApiKey } from './hooks/useApiKey';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { ConsolePanel } from './components/ConsolePanel';
import { SimPanel } from './components/sim/SimPanel';

const LANG_STORAGE_KEY = 'cas_lang';
const SUPPORTED_LANGS = ['en', 'sk'];

export default function App() {
    const [lang, setLang] = useState(() => {
        const stored = localStorage.getItem(LANG_STORAGE_KEY);
        return SUPPORTED_LANGS.includes(stored) ? stored : 'en';
    });
    const [activeTab, setActiveTab] = useState('console');

    useEffect(() => {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
        document.documentElement.lang = lang;
    }, [lang]);
    const { apiKey, status: keyStatus, save: saveApiKey } = useApiKey();

    const t = TRANSLATIONS[lang];

    const tabs = [
        { key: 'console',  label: t.console },
        { key: 'pendulum', label: t.pendulum },
        { key: 'ballbeam', label: t.ballBeam },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: '"Inter", system-ui, sans-serif' }}>
            <Header lang={lang} setLang={setLang} apiKey={apiKey} keyStatus={keyStatus} onSaveApiKey={saveApiKey} t={t} />
            <TabBar tabs={tabs} active={activeTab} onSelect={setActiveTab} />

            <main style={{ maxWidth: 1200, margin: '0 auto', padding: 28 }}>
                {activeTab === 'console'  && <ConsolePanel apiKey={apiKey} t={t} />}
                {activeTab === 'pendulum' && <SimPanel type="inverted-pendulum" apiKey={apiKey} t={t} />}
                {activeTab === 'ballbeam' && <SimPanel type="ball-beam"         apiKey={apiKey} t={t} />}
            </main>
        </div>
    );
}
