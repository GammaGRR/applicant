import type { DocumentItem } from '../../components/ApplicantDocument';

export const cleanDisplayValue = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') {
    return value
      .replace(/^["']|["']$/g, '')
      .replace(/^\{|\}$/g, '')
      .replace(/\\["']/g, '"')
      .replace(/(?:label|value)\s*:\s*"?([^",}]+)"?/i, '$1')
      .trim();
  }
  if (typeof value === 'object' && value !== null) {
    return (value as { label?: string; value?: string }).label
      || (value as { label?: string; value?: string }).value
      || JSON.stringify(value);
  }
  return String(value);
};

export const parseBenefits = (value: unknown): string[] => {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  const s = String(value)
    .trim()
    .replace(/^\[|\]$/g, '')
    .replace(/^["']|["']$/g, '');
  if (!s) return [];
  return s
    .split(/[,;/\n]+/)
    .map((x) => x.trim().replace(/^["']|["']$/g, ''))
    .map((x) => x.replace(/\s+/g, ' '))
    .filter(Boolean);
};

export const computePointFromGpa = (formData: Record<string, unknown> | undefined | null): number | undefined => {
  if (!formData) return undefined;
  for (const v of Object.values(formData)) {
    if (!v) continue;
    if (typeof v === 'object') {
      const o = v as Record<string, unknown>;
      const n2 = Math.max(0, parseInt(String(o.n2 ?? ''), 10) || 0);
      const n3 = Math.max(0, parseInt(String(o.n3 ?? ''), 10) || 0);
      const n4 = Math.max(0, parseInt(String(o.n4 ?? ''), 10) || 0);
      const n5 = Math.max(0, parseInt(String(o.n5 ?? ''), 10) || 0);
      const total = n2 + n3 + n4 + n5;
      if (total > 0) return (2 * n2 + 3 * n3 + 4 * n4 + 5 * n5) / total;

      const grades: unknown[] = Array.isArray(o.grades) ? o.grades : [];
      if (grades.length) {
        const nums = grades
          .map((x) => Number(String(x).replace(',', '.')))
          .filter((n) => Number.isFinite(n));
        if (nums.length) return nums.reduce((a, b) => a + b, 0) / nums.length;
      }
    }
  }
  return undefined;
};

export const getDocCount = (docs: DocumentItem[] | undefined, label: string): number | '' => {
  if (!docs?.length) return '';
  const target = label.toLowerCase();
  const item = docs.find((d) => String(d.name ?? '').toLowerCase().includes(target));
  const n = item && item.status === 'done' ? Number((item as DocumentItem & { count?: number }).count ?? 0) : 0;
  return n > 0 ? n : '';
};
