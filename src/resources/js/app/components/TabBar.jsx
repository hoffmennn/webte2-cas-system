import React from 'react';

export function TabBar({ tabs, active, onSelect }) {
    return (
        <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', display: 'flex' }}>
            {tabs.map(tab => {
                const isActive = active === tab.key;
                return (
                    <button key={tab.key} onClick={() => onSelect(tab.key)}
                        style={{ padding: '12px 20px', border: 'none', borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent', background: 'none', cursor: 'pointer', fontWeight: isActive ? 600 : 400, color: isActive ? '#3b82f6' : '#64748b', fontSize: 14, marginBottom: -1 }}>
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
