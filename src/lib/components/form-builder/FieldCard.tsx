import { X, Trash2, GripVertical } from 'lucide-react';
import { PERSON_FIELDS, DEFAULT_PERSON_FIELDS } from '../elements/PersonSection';
import type { FieldType, FormBuilderField } from './types';
import { COL_OPTIONS, FIELD_TYPES, NO_GROUP_TYPES } from './constants';
import { OptionsEditor } from './OptionsEditor';

type Props = {
  field: FormBuilderField;
  updateField: (uid: string, data: Partial<FormBuilderField>) => void;
  removeField: (uid: string) => void;
  addFieldToGroup: (groupUid: string, type: FieldType) => void;
  fields: FormBuilderField[];
};

export const FieldCard = ({ field, updateField, removeField, addFieldToGroup, fields }: Props) => {
  const groupFields = field.isGroup
    ? fields.filter((f) => f.groupId === field.uid).sort((a, b) => a.order - b.order)
    : [];

  const isDbType = ['specialty', 'benefit', 'documents'].includes(field.type);

  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-5
        ${field.type === 'heading' ? 'border-l-4 border-blue-500' : ''}
        ${field.type === 'group' ? 'border border-dashed border-blue-300' : ''}
        ${isDbType ? 'border border-dashed border-green-300' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical size={16} className="text-gray-300" />
          <span
            className={`text-xs font-medium px-2 py-1 rounded-md
              ${field.type === 'group' ? 'bg-purple-50 text-purple-600' : ''}
              ${isDbType ? 'bg-green-50 text-green-700' : ''}
              ${!field.type || (!['group'].includes(field.type) && !isDbType) ? 'bg-blue-50 text-blue-600' : ''}
            `}
          >
            {FIELD_TYPES.find((ft) => ft.type === field.type)?.label}
          </span>
          {isDbType && (
            <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">из БД</span>
          )}
        </div>
        <button type="button" onClick={() => removeField(field.uid)} className="p-1 text-red-400 hover:text-red-600">
          <Trash2 size={15} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <input
          placeholder={
            field.type === 'heading'
              ? 'Текст заголовка'
              : field.type === 'group'
                ? 'Название группы (необязательно)'
                : 'Название поля'
          }
          value={field.label}
          onChange={(e) => updateField(field.uid, { label: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        {['text', 'textarea', 'phone'].includes(field.type) && (
          <input
            placeholder="Плейсхолдер"
            value={field.placeholder}
            onChange={(e) => updateField(field.uid, { placeholder: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        {['radio', 'select', 'checkbox'].includes(field.type) && (
          <OptionsEditor options={field.options} onChange={(opts) => updateField(field.uid, { options: opts })} />
        )}
        {field.type === 'gpa' && (
          <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            В анкете появятся поля для количества 2/3/4/5, средний балл будет считаться автоматически.
          </p>
        )}
        {isDbType && (
          <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
            {field.type === 'specialty' && 'Варианты подтягиваются из таблицы специальностей'}
            {field.type === 'benefit' && 'Варианты подтягиваются из таблицы льгот'}
            {field.type === 'documents' && 'Чекбоксы подтягиваются из таблицы документов'}
          </p>
        )}
        {['radio', 'checkbox', 'documents'].includes(field.type) && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Направление:</span>
            <button
              type="button"
              onClick={() => updateField(field.uid, { direction: 'row' })}
              className={`px-2 py-1 text-xs rounded-md transition ${(field.direction ?? 'row') === 'row' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              В строку
            </button>
            <button
              type="button"
              onClick={() => updateField(field.uid, { direction: 'col' })}
              className={`px-2 py-1 text-xs rounded-md transition ${field.direction === 'col' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              В колонку
            </button>
          </div>
        )}
        {field.type === 'group' && (
          <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
            <p className="text-xs text-gray-500 mb-2">Поля внутри группы:</p>
            <div className="flex flex-col gap-2 mb-3">
              {groupFields.map((gf) => (
                <div
                  key={gf.uid}
                  className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {FIELD_TYPES.find((ft) => ft.type === gf.type)?.label}
                    </span>
                    <span className="text-xs text-gray-500">{gf.label || 'Без названия'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {COL_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateField(gf.uid, { cols: opt.value })}
                        className={`px-1.5 py-0.5 text-xs rounded transition ${gf.cols === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => removeField(gf.uid)}
                      className="ml-1 text-red-400 hover:text-red-600"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {FIELD_TYPES.filter((ft) => !NO_GROUP_TYPES.includes(ft.type)).map((ft) => (
                <button
                  key={ft.type}
                  type="button"
                  onClick={() => addFieldToGroup(field.uid, ft.type)}
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                >
                  + {ft.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {field.type === 'person' && (
          <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
            <p className="text-xs text-gray-500 mb-2">Поля блока персоны:</p>
            <div className="flex flex-col gap-1.5">
              {PERSON_FIELDS.map((pf) => {
                const active = (field.options ?? DEFAULT_PERSON_FIELDS).includes(pf.key);
                return (
                  <label key={pf.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => {
                        const current = field.options?.length > 0 ? field.options : [...DEFAULT_PERSON_FIELDS];
                        const updated = e.target.checked
                          ? [...current, pf.key]
                          : current.filter((k) => k !== pf.key);
                        updateField(field.uid, { options: updated });
                      }}
                      className="accent-blue-500"
                    />
                    <span className="text-xs text-gray-700">{pf.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
        {field.type === 'person' && (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={field.isApplicant ?? false}
              onChange={(e) => {
                if (e.target.checked) {
                  updateField(field.uid, { isApplicant: true });
                  fields.forEach((f) => {
                    if (f.type === 'person' && f.uid !== field.uid) {
                      updateField(f.uid, { isApplicant: false });
                    }
                  });
                } else {
                  updateField(field.uid, { isApplicant: false });
                }
              }}
              className="accent-blue-500"
            />
            <span className="text-gray-700">
              Это абитуриент <span className="text-xs text-gray-400">(ФИО попадёт в таблицу)</span>
            </span>
          </label>
        )}
        {!['heading', 'group', 'person', 'documents'].includes(field.type) && (
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => updateField(field.uid, { required: e.target.checked })}
                className="accent-blue-500"
              />
              Обязательное поле
            </label>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 mr-1">Ширина:</span>
              {COL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateField(field.uid, { cols: opt.value })}
                  className={`px-2 py-1 text-xs rounded-md transition ${field.cols === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
