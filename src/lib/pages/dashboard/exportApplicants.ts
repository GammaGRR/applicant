import type { FormField } from '../../components/ApplicantFormModal';
import type { Applicant } from './types';
import { countableDocLabels } from './constants';
import { cleanDisplayValue, computePointFromGpa, getDocCount, parseBenefits } from './utils';

const PERSON_SUBFIELDS: { key: string; label: string }[] = [
  { key: 'lastName', label: 'Фамилия' },
  { key: 'firstName', label: 'Имя' },
  { key: 'middleName', label: 'Отчество' },
  { key: 'address', label: 'Адрес' },
  { key: 'phone', label: 'Телефон' },
  { key: 'workplace', label: 'Место работы' },
  { key: 'position', label: 'Должность' },
];

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export async function getActiveFormFields(token: string | null): Promise<FormField[]> {
  try {
    const res = await fetch('http://localhost:3000/forms/active', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) return [];
    const form = await res.json();
    return form?.fields || [];
  } catch {
    return [];
  }
}

export function flattenFormDataForExport(formData: Record<string, unknown>, fields: FormField[]): Record<string, string> {
  const out: Record<string, string> = {};
  fields.forEach((f) => {
    if (['heading', 'group'].includes(f.type)) return;
    const raw = formData?.[f.id];
    if (f.type === 'person' && raw && typeof raw === 'object') {
      const p = raw as Record<string, unknown>;
      PERSON_SUBFIELDS.forEach((sf) => {
        out[`${f.label}: ${sf.label}`] = cleanDisplayValue(p[sf.key] ?? '');
      });
      return;
    }
    if (f.type === 'gpa' && raw && typeof raw === 'object') {
      const g = raw as Record<string, unknown>;
      const n2 = Math.max(0, parseInt(String(g.n2 ?? ''), 10) || 0);
      const n3 = Math.max(0, parseInt(String(g.n3 ?? ''), 10) || 0);
      const n4 = Math.max(0, parseInt(String(g.n4 ?? ''), 10) || 0);
      const n5 = Math.max(0, parseInt(String(g.n5 ?? ''), 10) || 0);
      const total = n2 + n3 + n4 + n5;
      const avg = total ? (2 * n2 + 3 * n3 + 4 * n4 + 5 * n5) / total : NaN;
      out[`${f.label}: Двоек`] = String(n2 || '');
      out[`${f.label}: Троек`] = String(n3 || '');
      out[`${f.label}: Четвёрок`] = String(n4 || '');
      out[`${f.label}: Пятёрок`] = String(n5 || '');
      out[`${f.label}: Средний балл`] = Number.isFinite(avg) ? avg.toFixed(2) : '';
      return;
    }
    if (Array.isArray(raw)) {
      out[f.label] = raw.filter(Boolean).join('; ');
      return;
    }
    if (raw !== null && raw !== undefined) {
      out[f.label] = cleanDisplayValue(raw);
      return;
    }
    out[f.label] = '';
  });
  return out;
}

export async function fetchAllApplicantsForExport(token: string | null): Promise<Applicant[]> {
  const all: Applicant[] = [];
  const limit = 500;
  let page = 1;
  let total = Infinity;

  while (all.length < total) {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));

    const res = await fetch(`http://localhost:3000/applicants?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) throw new Error('export_fetch_failed');
    const data = await res.json();
    const items: Applicant[] = Array.isArray(data) ? data : (data.items ?? []);
    total = Array.isArray(data) ? items.length : Number(data.total ?? items.length);

    all.push(...items.map((a: Applicant) => ({ ...a, documents: a.documents ?? [] })));
    if (items.length === 0) break;
    page += 1;
    if (page > 10000) break;
  }

  return all;
}

function buildFormHeaders(fields: FormField[]): string[] {
  const formHeaders: string[] = [];
  fields.forEach((f) => {
    if (['heading', 'group'].includes(f.type)) return;
    if (f.type === 'person') {
      PERSON_SUBFIELDS.forEach((sf) => formHeaders.push(`${f.label}: ${sf.label}`));
    } else if (f.type === 'gpa') {
      formHeaders.push(
        `${f.label}: Двоек`,
        `${f.label}: Троек`,
        `${f.label}: Четвёрок`,
        `${f.label}: Пятёрок`,
        `${f.label}: Средний балл`,
      );
    } else {
      formHeaders.push(f.label);
    }
  });
  return formHeaders;
}

const baseHeadersWithDocCounts = [
  '№ дела',
  'ФИО',
  'Классы',
  'Специальность',
  'Финансирование',
  'Средний балл',
  'Льготы',
  'Примечание',
  'Дата подачи',
  ...countableDocLabels.map((x) => `${x} (кол-во)`),
];

const baseHeadersPdf = [
  '№ дела',
  'ФИО',
  'Классы',
  'Специальность',
  'Финансирование',
  'Балл',
  'Льготы',
  'Примечание',
  ...countableDocLabels.map((x) => `${x} (кол-во)`),
];

function applicantBaseRowCsvXlsx(a: Applicant) {
  const p = a.point ?? computePointFromGpa(a.formData);
  return [
    a.caseNumber,
    a.fullName,
    a.classes,
    a.profession,
    cleanDisplayValue(a.finance),
    Number.isFinite(p as number) ? (p as number).toFixed(2) : '',
    parseBenefits(a.benefit).join('; '),
    a.note,
    new Date(a.createdAt).toLocaleDateString('ru-RU'),
    ...countableDocLabels.map((lbl) => getDocCount(a.documents, lbl)),
  ];
}

function applicantBaseRowPdf(a: Applicant) {
  const p = a.point ?? computePointFromGpa(a.formData);
  return [
    a.caseNumber,
    a.fullName,
    a.classes,
    a.profession,
    cleanDisplayValue(a.finance),
    Number.isFinite(p as number) ? (p as number).toFixed(2) : '',
    parseBenefits(a.benefit).join('; '),
    a.note,
    ...countableDocLabels.map((lbl) => getDocCount(a.documents, lbl)),
  ];
}

export async function exportAllApplicantsCSV(token: string | null) {
  const [fields, applicants] = await Promise.all([
    getActiveFormFields(token),
    fetchAllApplicantsForExport(token),
  ]);

  const formHeaders = buildFormHeaders(fields);
  const headers = [...baseHeadersWithDocCounts, ...formHeaders];
  const rows = applicants.map((a) => {
    const baseRow = applicantBaseRowCsvXlsx(a);
    const flat = flattenFormDataForExport(a.formData ?? {}, fields);
    const formRow = formHeaders.map((h) => flat[h] ?? '');
    return [...baseRow, ...formRow].map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
  });

  const bom = '\uFEFF';
  const blob = new Blob([bom + [headers.map((h) => `"${h}"`).join(','), ...rows].join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  downloadBlob(blob, `applicants_full_export_${new Date().toISOString().slice(0, 10)}.csv`);
}

export async function exportAllApplicantsXLSX(token: string | null) {
  const XLSX = await import('xlsx');
  const [fields, applicants] = await Promise.all([
    getActiveFormFields(token),
    fetchAllApplicantsForExport(token),
  ]);

  const formHeaders = buildFormHeaders(fields);
  const headers = [...baseHeadersWithDocCounts, ...formHeaders];
  const wsData = [
    headers,
    ...applicants.map((a) => {
      const baseRow = applicantBaseRowCsvXlsx(a);
      const flat = flattenFormDataForExport(a.formData ?? {}, fields);
      const formRow = formHeaders.map((h) => flat[h] ?? '');
      return [...baseRow, ...formRow];
    }),
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Абитуриенты');
  XLSX.writeFile(wb, `applicants_full_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export async function exportAllApplicantsPDF(token: string | null) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const [fields, applicants] = await Promise.all([
    getActiveFormFields(token),
    fetchAllApplicantsForExport(token),
  ]);

  const formHeaders = buildFormHeaders(fields);
  const headers = [...baseHeadersPdf, ...formHeaders];

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  autoTable(doc, {
    head: [headers],
    body: applicants.map((a) => {
      const baseRow = applicantBaseRowPdf(a);
      const flat = flattenFormDataForExport(a.formData ?? {}, fields);
      const formRow = formHeaders.map((h) => flat[h] ?? '');
      return [...baseRow, ...formRow];
    }),
    styles: { font: 'helvetica', fontSize: 7, cellWidth: 'wrap' },
    margin: { top: 15 },
  });
  doc.save(`applicants_full_export_${new Date().toISOString().slice(0, 10)}.pdf`);
}
