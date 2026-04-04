import { useState } from 'react';
import { Field } from '../Field';
import { PersonSection } from '../elements/PersonSection';
import type { PersonInfo } from '../../types/formTypes';
import type { FormBuilderField } from './types';
import { getColClass } from './constants';
import { useDbOptions } from './useDbOptions';
import { renderFieldContent } from './renderFieldContent';

export const FormPreview = ({ fields }: { fields: FormBuilderField[] }) => {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const dbOptions = useDbOptions();

  const topLevel = [...fields].filter((f) => !f.groupId).sort((a, b) => a.order - b.order);

  return (
    <div className="grid grid-cols-3 gap-4">
      {topLevel.map((field) => {
        if (field.type === 'heading') {
          return (
            <div key={field.uid} className="col-span-3 pt-2 pb-1 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-800">{field.label || 'Заголовок'}</h3>
            </div>
          );
        }

        if (field.type === 'group') {
          const groupFields = [...fields]
            .filter((f) => f.groupId === field.uid)
            .sort((a, b) => a.order - b.order);
          return (
            <div key={field.uid} className="col-span-3 border border-gray-200 rounded-xl p-4">
              {field.label && <p className="text-sm font-medium text-gray-600 mb-3">{field.label}</p>}
              <div className="grid grid-cols-3 gap-3">
                {groupFields.map((gf) => {
                  const value = values[gf.uid];
                  const onChange = (v: unknown) => setValues((p) => ({ ...p, [gf.uid]: v }));
                  return (
                    <div key={gf.uid} className={getColClass(gf.cols ?? 3)}>
                      <Field label={gf.type === 'checkbox' ? '' : gf.label || 'Поле'} required={gf.required}>
                        {renderFieldContent(gf, value, onChange, setValues, dbOptions)}
                      </Field>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        if (field.type === 'person') {
          const emptyPerson: PersonInfo = {
            lastName: '',
            firstName: '',
            middleName: '',
            address: '',
            phone: '',
            workplace: '',
            position: '',
          };
          return (
            <div key={field.uid} className="col-span-3">
              <PersonSection
                title={field.label}
                data={(values[field.uid] as PersonInfo) ?? emptyPerson}
                onChange={(key, val) =>
                  setValues((p) => ({
                    ...p,
                    [field.uid]: { ...(p[field.uid] as object), [key]: val },
                  }))
                }
              />
            </div>
          );
        }

        if (field.type === 'documents') {
          const value = values[field.uid];
          const onChange = (v: unknown) => setValues((p) => ({ ...p, [field.uid]: v }));
          return (
            <div key={field.uid} className="col-span-3">
              <Field label={field.label || 'Документы'} required={field.required}>
                {renderFieldContent(field, value, onChange, setValues, dbOptions)}
              </Field>
            </div>
          );
        }

        const value = values[field.uid];
        const onChange = (v: unknown) => setValues((p) => ({ ...p, [field.uid]: v }));

        return (
          <div key={field.uid} className={getColClass(field.cols ?? 3)}>
            <Field label={field.type === 'checkbox' ? '' : field.label || 'Поле'} required={field.required}>
              {renderFieldContent(field, value, onChange, setValues, dbOptions)}
            </Field>
          </div>
        );
      })}
    </div>
  );
};
