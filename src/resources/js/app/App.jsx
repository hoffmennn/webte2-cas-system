import React, { useEffect, useState } from 'react';
import { TRANSLATIONS } from './lib/i18n';
import { useApiKey } from './hooks/useApiKey';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { ConsolePanel } from './components/ConsolePanel';
import { SimPanel } from './components/sim/SimPanel';
import { StatsPanel } from './components/StatsPanel';
import { DocsPanel } from './components/DocsPanel';

const LANG_STORAGE_KEY = 'cas_lang';
const SUPPORTED_LANGS = ['en', 'sk'];
const TAB_KEYS = ['console', 'pendulum', 'ballbeam', 'stats', 'docs'];
const DEFAULT_TAB = 'console';

function tabFromHash() {
    const hash = window.location.hash.replace(/^#/, '');
    return TAB_KEYS.includes(hash) ? hash : DEFAULT_TAB;
}

export default function App() {
    const [lang, setLang] = useState(() => {
        const stored = localStorage.getItem(LANG_STORAGE_KEY);
        return SUPPORTED_LANGS.includes(stored) ? stored : 'en';
    });
    const [activeTab, setActiveTab] = useState(tabFromHash);

    useEffect(() => {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
        document.documentElement.lang = lang;
    }, [lang]);

    useEffect(() => {
        if (window.location.hash.replace(/^#/, '') !== activeTab) {
            window.history.replaceState(null, '', `#${activeTab}`);
        }
    }, [activeTab]);

    useEffect(() => {
        const onHashChange = () => setActiveTab(tabFromHash());
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);
    const { apiKey, status: keyStatus, save: saveApiKey } = useApiKey();

    const t = TRANSLATIONS[lang];

    const tabs = [
        { key: 'console',  label: t.console },
        { key: 'pendulum', label: t.pendulum },
        { key: 'ballbeam', label: t.ballBeam },
        { key: 'stats',    label: t.tabs.stats },
        { key: 'docs',     label: t.tabs.docs },
    ];

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            <Header lang={lang} setLang={setLang} apiKey={apiKey} keyStatus={keyStatus} onSaveApiKey={saveApiKey} t={t} />
            <TabBar tabs={tabs} active={activeTab} onSelect={setActiveTab} />

            <main className="max-w-[1200px] mx-auto p-4 md:p-7">
                {activeTab === 'console'  && <ConsolePanel apiKey={apiKey} t={t} />}
                {activeTab === 'pendulum' && <SimPanel type="inverted-pendulum" apiKey={apiKey} t={t} />}
                {activeTab === 'ballbeam' && <SimPanel type="ball-beam"         apiKey={apiKey} t={t} />}
                {activeTab === 'stats'    && <StatsPanel apiKey={apiKey} t={t} />}
                {activeTab === 'docs'     && <DocsPanel t={t} />}
            </main>
        </div>
    );
}
