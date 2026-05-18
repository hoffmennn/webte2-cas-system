import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const SPEC_URL = '/api/openapi.yaml';
const PDF_URL  = '/docs.pdf';

export function DocsPanel({ t }) {
    return (
        <div>
            <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800 m-0">{t.docs.title}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{t.docs.subtitle}</p>
                </div>
                <a href={PDF_URL} target="_blank" rel="noopener noreferrer"
                   className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-semibold whitespace-nowrap">
                    {t.docs.download_pdf}
                </a>
            </div>
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
                <SwaggerUI url={SPEC_URL} />
            </div>
        </div>
    );
}
