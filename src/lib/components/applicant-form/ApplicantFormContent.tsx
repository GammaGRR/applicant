import { useState, useEffect } from 'react';
import { TextInput } from '../elements/TextInput';
import { TextArea } from '../elements/TextArea';
import { PhoneInput } from '../elements/PhoneInput';
import { RadioGroup } from '../elements/RadioGroup';
import { Checkbox } from '../elements/CheckBox';
import { Select } from '../elements/Select';
import { Field } from '../Field';
import { PersonSection, DEFAULT_PERSON_FIELDS } from '../elements/PersonSection';
import type { PersonInfo } from '../../types/formTypes';
import type { ActiveForm, FormField } from './types';
import { DocumentsWithCounts } from './DocumentsWithCounts';
import { getColClass } from './grid';

type FormContentProps = {
  form: ActiveForm;
  values: Record<string, unknown>;
  setValues: (fn: (prev: Record<string, unknown>) => Record<string, unknown>) => void;
  readOnly?: boolean;
};

export const ApplicantFormContent = ({
  form,
  values,
  setValues,
  readOnly = false,
}: FormContentProps) => {
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/specialities')
      .then((r) => r.json())
      .then((data) => setSpecialties(data.map((s: { code: string; name: string }) => `${s.code} ${s.name}`)))
      .catch(() => {});
    fetch('http://localhost:3000/benefits')
      .then((r) => r.json())
      .then((data) => setBenefits(data.map((b: { name: string }) => b.name)))
      .catch(() => {});
    fetch('http://localhost:3000/documents')
      .then((r) => r.json())
      .then((data) => setDocuments(data.map((d: { name: string }) => d.name)))
      .catch(() => {});
  }, []);

  const renderFieldContent = (field: FormField) => {
    const value = values[field.id];
    const onChange = (v: unknown) => setValues((prev) => ({ ...prev, [field.id]: v }));

    switch (field.type) {
      case 'person': {
        const empty: PersonInfo = {
          lastName: '',
          firstName: '',
          middleName: '',
          address: '',
          phone: '',
          workplace: '',
          position: '',
        };
        return (
          <PersonSection
            title={field.label}
            data={(values[field.id] as PersonInfo) ?? empty}
            onChange={
              readOnly
                ? () => {}
                : (key, val) =>
                    setValues((prev) => ({
                      ...prev,
                      [field.id]: { ...(prev[field.id] as object), [key]: val },
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
      }
      case 'radio':
        return (
          <RadioGroup
            value={(value ?? '') as string}
            onChange={readOnly ? () => {} : onChange}
            options={field.options.map((o) => ({ label: o, value: o }))}
            direction={field.direction ?? 'row'}
          />
        );
      case 'text':
        return (
          <TextInput
            value={(value ?? '') as string}
            onChange={readOnly ? () => {} : onChange}
            placeholder={field.placeholder}
          />
        );
      case 'textarea':
        return (
          <TextArea
            value={(value ?? '') as string}
            onChange={readOnly ? () => {} : onChange}
            placeholder={field.placeholder}
          />
        );
      case 'phone':
        return (
          <PhoneInput value={(value ?? '') as string} onChange={readOnly ? () => {} : onChange} />
        );
      case 'checkbox':
        return field.options?.length > 0 ? (
          <Checkbox
            options={field.options}
            value={(value ?? []) as string[]}
            onChangeMultiple={readOnly ? () => {} : onChange}
            direction={field.direction ?? 'row'}
          />
        ) : (
          <Checkbox
            label={field.label}
            checked={(value ?? false) as boolean}
            onChange={readOnly ? () => {} : onChange}
          />
        );
      case 'select':
        return (
          <Select
            value={(value ?? '') as string}
            onChange={readOnly ? () => {} : onChange}
            options={field.options}
          />
        );
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
                onChange={(e) => {
                  if (readOnly) return;
                  onChange({ ...counts, n2: e.target.value });
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                inputMode="numeric"
                placeholder="Троек"
                value={String(counts.n3 ?? '')}
                onChange={(e) => {
                  if (readOnly) return;
                  onChange({ ...counts, n3: e.target.value });
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                inputMode="numeric"
                placeholder="Четвёрок"
                value={String(counts.n4 ?? '')}
                onChange={(e) => {
                  if (readOnly) return;
                  onChange({ ...counts, n4: e.target.value });
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                inputMode="numeric"
                placeholder="Пятёрок"
                value={String(counts.n5 ?? '')}
                onChange={(e) => {
                  if (readOnly) return;
                  onChange({ ...counts, n5: e.target.value });
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
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
        return (
          <Select
            value={(value ?? '') as string}
            onChange={readOnly ? () => {} : onChange}
            options={specialties}
          />
        );
      case 'benefit':
        return (
          <Checkbox
            options={benefits}
            value={(value ?? []) as string[]}
            onChangeMultiple={readOnly ? () => {} : onChange}
            direction={field.direction ?? 'col'}
          />
        );
      case 'documents':
        return (
          <DocumentsWithCounts
            options={documents}
            value={value ?? { selected: [], counts: {} }}
            onChange={onChange}
            readOnly={readOnly}
          />
        );
      default:
        return null;
    }
  };

  const renderField = (field: FormField) => {
    if (field.type === 'heading')
      return (
        <div key={field.id} className="pt-2 pb-1 border-b border-gray-200 col-span-3">
          <h3 className="text-base font-semibold text-gray-800">{field.label}</h3>
        </div>
      );
    if (field.type === 'group') {
      const groupFields = form.fields
        .filter((f) => f.groupId === String(field.id))
        .sort((a, b) => a.order - b.order);
      return (
        <div key={field.id} className="col-span-3 border border-gray-200 rounded-xl p-4">
          {field.label && <p className="text-sm font-medium text-gray-600 mb-3">{field.label}</p>}
          <div className="grid grid-cols-3 gap-3">
            {groupFields.map((gf) => (
              <div key={gf.id} className={getColClass(gf.cols ?? 3)}>
                <Field label={gf.type === 'checkbox' ? '' : gf.label} required={gf.required}>
                  {renderFieldContent(gf)}
                </Field>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (field.type === 'person' || field.type === 'documents')
      return (
        <div key={field.id} className="col-span-3">
          <Field
            label={field.label || (field.type === 'documents' ? 'Документы' : '')}
            required={field.required}
          >
            {renderFieldContent(field)}
          </Field>
        </div>
      );
    return (
      <div key={field.id} className={getColClass(field.cols ?? 3)}>
        <Field label={field.type === 'checkbox' ? '' : field.label} required={field.required}>
          {renderFieldContent(field)}
        </Field>
      </div>
    );
  };

  const topLevelFields = form.fields.filter((f) => !f.groupId).sort((a, b) => a.order - b.order);
  return (
    <div
      className={`grid grid-cols-3 gap-4 ${readOnly ? 'pointer-events-none opacity-80' : ''}`}
    >
      {topLevelFields.map((field) => renderField(field))}
    </div>
  );
};
