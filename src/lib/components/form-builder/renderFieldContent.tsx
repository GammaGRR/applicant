import { TextInput } from '../elements/TextInput';
import { TextArea } from '../elements/TextArea';
import { PhoneInput } from '../elements/PhoneInput';
import { RadioGroup } from '../elements/RadioGroup';
import { Checkbox } from '../elements/CheckBox';
import { Select } from '../elements/Select';
import { PersonSection, DEFAULT_PERSON_FIELDS } from '../elements/PersonSection';
import type { PersonInfo } from '../../types/formTypes';
import type { FormBuilderField } from './types';

type DbOptions = { specialties: string[]; benefits: string[]; documents: string[] };

export const renderFieldContent = (
  field: FormBuilderField,
  value: unknown,
  onChange: (v: unknown) => void,
  setValues: (fn: (p: Record<string, unknown>) => Record<string, unknown>) => void,
  dbOptions: DbOptions,
) => {
  switch (field.type) {
    case 'text':
      return (
        <TextInput value={(value ?? '') as string} onChange={onChange} placeholder={field.placeholder} />
      );
    case 'textarea':
      return (
        <TextArea value={(value ?? '') as string} onChange={onChange} placeholder={field.placeholder} />
      );
    case 'phone':
      return <PhoneInput value={(value ?? '') as string} onChange={onChange} />;
    case 'radio':
      return (
        <RadioGroup
          value={(value ?? '') as string}
          onChange={onChange}
          options={field.options.map((o) => ({ label: o, value: o }))}
          direction={field.direction ?? 'row'}
        />
      );
    case 'checkbox':
      return field.options.length > 0 ? (
        <Checkbox
          options={field.options}
          value={(value ?? []) as string[]}
          onChangeMultiple={onChange}
          direction={field.direction ?? 'row'}
        />
      ) : (
        <Checkbox label={field.label || 'Чекбокс'} checked={(value ?? false) as boolean} onChange={onChange} />
      );
    case 'select':
      return <Select value={(value ?? '') as string} onChange={onChange} options={field.options} />;
    case 'gpa': {
      const counts =
        typeof value === 'object' && value
          ? (value as Record<string, unknown>)
          : { n2: '', n3: '', n4: '', n5: '' };
      const n2 = Math.max(0, parseInt(String(counts.n2 ?? ''), 10) || 0);
      const n3 = Math.max(0, parseInt(String(counts.n3 ?? ''), 10) || 0);
      const n4 = Math.max(0, parseInt(String(counts.n4 ?? ''), 10) || 0);
      const n5 = Math.max(0, parseInt(String(counts.n5 ?? ''), 10) || 0);
      const total = n2 + n3 + n4 + n5;
      const avg = total ? (2 * n2 + 3 * n3 + 4 * n4 + 5 * n5) / total : NaN;
      return (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input
              inputMode="numeric"
              placeholder="Двоек"
              value={String(counts.n2 ?? '')}
              onChange={(e) => onChange({ ...counts, n2: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              inputMode="numeric"
              placeholder="Троек"
              value={String(counts.n3 ?? '')}
              onChange={(e) => onChange({ ...counts, n3: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              inputMode="numeric"
              placeholder="Четвёрок"
              value={String(counts.n4 ?? '')}
              onChange={(e) => onChange({ ...counts, n4: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              inputMode="numeric"
              placeholder="Пятёрок"
              value={String(counts.n5 ?? '')}
              onChange={(e) => onChange({ ...counts, n5: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <span className="text-xs text-gray-500">Средний балл</span>
            <span className="text-sm font-semibold text-gray-800">
              {Number.isFinite(avg) ? avg.toFixed(2) : '—'}
            </span>
          </div>
        </div>
      );
    }
    case 'specialty':
      return <Select value={(value ?? '') as string} onChange={onChange} options={dbOptions.specialties} />;
    case 'benefit':
      return (
        <Checkbox
          options={dbOptions.benefits}
          value={(value ?? []) as string[]}
          onChangeMultiple={onChange}
          direction={field.direction ?? 'col'}
        />
      );
    case 'documents':
      return (
        <Checkbox
          options={dbOptions.documents}
          value={(value ?? []) as string[]}
          onChangeMultiple={onChange}
          direction={field.direction ?? 'col'}
        />
      );
    case 'person':
      return (
        <PersonSection
          title={field.label}
          data={
            (value as PersonInfo) ?? {
              lastName: '',
              firstName: '',
              middleName: '',
              address: '',
              phone: '',
              workplace: '',
              position: '',
            }
          }
          onChange={(key, val) =>
            setValues((p) => ({
              ...p,
              [field.uid]: { ...(p[field.uid] as object), [key]: val },
            }))
          }
          activeFields={
            field.options?.length > 0
              ? field.options.filter((o): o is keyof PersonInfo =>
                  DEFAULT_PERSON_FIELDS.includes(o as keyof PersonInfo),
                )
              : undefined
          }
        />
      );
    default:
      return null;
  }
};
