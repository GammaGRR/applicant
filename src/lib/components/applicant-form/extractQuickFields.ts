import type { FormField } from './types';

export const extractQuickFields = (fields: FormField[], values: Record<string, unknown>) => {
  let fullName = '',
    classes = '',
    profession = '',
    finance = '',
    benefit = '',
    note = '';
  let point: number | undefined;
  let checkedDocuments: string[] = [];
  let documentCounts: Record<string, number> = {};

  fields.forEach((f) => {
    const val = values[f.id];
    const label = (f.label ?? '').toLowerCase();

    if (f.type === 'person' && f.isApplicant && typeof val === 'object' && val !== null) {
      const p = val as Record<string, unknown>;
      const parts = [p.lastName, p.firstName, p.middleName].filter(Boolean);
      if (parts.length > 0) fullName = parts.join(' ');
    }
    if (f.type === 'specialty')
      profession = Array.isArray(val) ? val.join(', ') : String(val ?? '');
    if (f.type === 'benefit')
      benefit = Array.isArray(val) ? val.join(', ') : String(val ?? '');
    if (f.type === 'documents') {
      if (Array.isArray(val)) {
        checkedDocuments = val as string[];
        documentCounts = {};
      } else if (val && typeof val === 'object') {
        const o = val as { selected?: unknown; counts?: unknown };
        checkedDocuments = Array.isArray(o.selected) ? (o.selected as string[]) : [];
        const rawCounts = o.counts;
        if (rawCounts && typeof rawCounts === 'object') {
          const next: Record<string, number> = {};
          Object.entries(rawCounts as Record<string, unknown>).forEach(([k, v]) => {
            const n = Math.max(0, parseInt(String(v ?? ''), 10) || 0);
            if (n > 0) next[k] = n;
          });
          documentCounts = next;
        } else {
          documentCounts = {};
        }
      }
    }
    if (f.type === 'gpa') {
      const v = (val ?? {}) as Record<string, unknown>;
      const n2 = Math.max(0, parseInt(String(v?.n2 ?? ''), 10) || 0);
      const n3 = Math.max(0, parseInt(String(v?.n3 ?? ''), 10) || 0);
      const n4 = Math.max(0, parseInt(String(v?.n4 ?? ''), 10) || 0);
      const n5 = Math.max(0, parseInt(String(v?.n5 ?? ''), 10) || 0);
      const total = n2 + n3 + n4 + n5;
      if (total > 0) {
        point = (2 * n2 + 3 * n3 + 4 * n4 + 5 * n5) / total;
      } else {
        const grades: unknown[] = Array.isArray(v)
          ? v
          : Array.isArray(v?.grades)
            ? (v.grades as unknown[])
            : [];
        const nums = grades
          .map((x) => Number(String(x).replace(',', '.')))
          .filter((n) => Number.isFinite(n));
        if (nums.length) point = nums.reduce((a, b) => a + b, 0) / nums.length;
      }
    }

    if (label.includes('класс') || label.includes('образование')) classes = val as string;
    if (label.includes('финансиров') || label.includes('бюджет')) finance = val as string;
    if (f.type !== 'gpa' && (label.includes('балл') || label.includes('gpa'))) {
      point = parseFloat(String(val)) || undefined;
    }
    if (label.includes('примечан') || label.includes('заметк')) note = val as string;
    if (f.type !== 'specialty' && label.includes('специальност')) profession = val as string;
    if (f.type !== 'benefit' && label.includes('льгот'))
      benefit = Array.isArray(val) ? val.join(', ') : String(val ?? '');
  });

  return {
    fullName,
    classes,
    profession,
    finance,
    point,
    benefit,
    note,
    checkedDocuments,
    documentCounts,
  };
};
