import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { exportAllApplicantsCSV, exportAllApplicantsPDF, exportAllApplicantsXLSX } from './exportApplicants';

export function ExportDropdown() {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const run = async (kind: 'csv' | 'xlsx' | 'pdf') => {
    setExporting(true);
    try {
      if (kind === 'csv') await exportAllApplicantsCSV(token);
      if (kind === 'xlsx') await exportAllApplicantsXLSX(token);
      if (kind === 'pdf') await exportAllApplicantsPDF(token);
    } finally {
      setExporting(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={exporting}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm font-medium text-gray-700"
      >
        <Download size={13} />
        {exporting ? 'Экспорт…' : 'Экспорт'}
        <svg className={`w-3 h-3 ml-0.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <button type="button" onClick={() => run('csv')} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs hover:bg-gray-50 text-gray-700 text-left">
            <FileText size={14} className="text-green-500" /> Экспорт CSV
          </button>
          <button type="button" onClick={() => run('xlsx')} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs hover:bg-gray-50 text-gray-700 text-left">
            <FileSpreadsheet size={14} className="text-emerald-600" /> Экспорт XLSX
          </button>
          <button type="button" onClick={() => run('pdf')} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs hover:bg-gray-50 text-gray-700 text-left">
            <FileText size={14} className="text-red-500" /> Экспорт PDF
          </button>
        </div>
      )}
    </div>
  );
}
