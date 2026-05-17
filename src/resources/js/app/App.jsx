import React, { useState } from 'react';
import { STORAGE_KEYS } from './lib/constants';
import { TRANSLATIONS } from './lib/i18n';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { ConsolePanel } from './components/ConsolePanel';
import { SimPanel } from './components/sim/SimPanel';

export default function App() {
    const [lang, setLang] = useState('en');
    const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEYS.apiKey) || '');
    const [activeTab, setActiveTab] = useState('console');

    const t = TRANSLATIONS[lang];

    const saveApiKey = key => {
        localStorage.setItem(STORAGE_KEYS.apiKey, key);
        setApiKey(key);
    };

    const tabs = [
        { key: 'console',  label: t.console },
        { key: 'pendulum', label: t.pendulum },
        { key: 'ballbeam', label: t.ballBeam },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: '"Inter", system-ui, sans-serif' }}>
            <Header lang={lang} setLang={setLang} apiKey={apiKey} onSaveApiKey={saveApiKey} t={t} />
            <TabBar tabs={tabs} active={activeTab} onSelect={setActiveTab} />

            <main style={{ maxWidth: 1200, margin: '0 auto', padding: 28 }}>
                {activeTab === 'console'  && <ConsolePanel apiKey={apiKey} t={t} />}
                {activeTab === 'pendulum' && <SimPanel type="inverted-pendulum" apiKey={apiKey} t={t} />}
                {activeTab === 'ballbeam' && <SimPanel type="ball-beam"         apiKey={apiKey} t={t} />}
            </main>
        </div>
    );
}
