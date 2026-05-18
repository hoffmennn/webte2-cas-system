import React from 'react';

export function TabBar({ tabs, active, onSelect }) {
    return (
        <div className="bg-white border-b border-slate-200 px-4 md:px-6 flex overflow-x-auto">
            {tabs.map(tab => {
                const isActive = active === tab.key;
                return (
                    <button key={tab.key} onClick={() => onSelect(tab.key)}
                        className={`py-3 px-5 border-0 border-b-2 bg-transparent cursor-pointer text-sm -mb-px whitespace-nowrap ${isActive ? 'border-blue-500 text-blue-500 font-semibold' : 'border-transparent text-slate-500 font-normal'}`}>
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}
