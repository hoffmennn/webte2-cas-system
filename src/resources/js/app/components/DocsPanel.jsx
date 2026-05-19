import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export function DocsPanel({ t, lang }) {
    const specUrl = `/api/openapi.yaml?lang=${lang}`;
    const pdfUrl  = `/docs.pdf?lang=${lang}`;

    return (
        <div>
            <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800 m-0">{t.docs.title}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{t.docs.subtitle}</p>
                </div>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                   className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-semibold whitespace-nowrap">
                    {t.docs.download_pdf}
                </a>
            </div>
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
                {/* key forces remount so SwaggerUI refetches when language changes */}
                <SwaggerUI key={lang} url={specUrl} />
            </div>
        </div>
    );
}
