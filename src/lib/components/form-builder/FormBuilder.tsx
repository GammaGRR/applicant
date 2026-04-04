import { useState, useRef } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import type { FieldType, FormBuilderField } from './types';
import { emptyField, FIELD_TYPES } from './constants';
import { FormPreview } from './FormPreview';
import { FieldCard } from './FieldCard';

export const FormBuilder = ({
  form,
  onBack,
}: {
  form: { id: number; name: string; fields?: unknown[] };
  onBack: () => void;
}) => {
  const [name, setName] = useState(form.name);
  const [fields, setFields] = useState<FormBuilderField[]>(
    (form.fields ?? []).map((f) => {
      const x = f as Record<string, unknown>;
      return {
        ...x,
        uid: (x.uid as string) ?? crypto.randomUUID(),
        cols: (x.cols as number) ?? 3,
        isGroup: (x.isGroup as boolean) ?? false,
        groupId: (x.groupId as string | null) ?? null,
        direction: (x.direction as 'row' | 'col') ?? 'row',
        isApplicant: (x.isApplicant as boolean) ?? false,
      } as FormBuilderField;
    }),
  );
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  const topLevelFields = fields.filter((f) => !f.groupId).sort((a, b) => a.order - b.order);

  const addField = (type: FieldType) => {
    setFields((prev) => [...prev, emptyField(type, prev.filter((f) => !f.groupId).length)]);
  };

  const addFieldToGroup = (groupUid: string, type: FieldType) => {
    const groupFields = fields.filter((f) => f.groupId === groupUid);
    setFields((prev) => [...prev, emptyField(type, groupFields.length, groupUid)]);
  };

  const updateField = (uid: string, data: Partial<FormBuilderField>) => {
    setFields((prev) => prev.map((f) => (f.uid === uid ? { ...f, ...data } : f)));
  };

  const removeField = (uid: string) => {
    setFields((prev) => prev.filter((f) => f.uid !== uid && f.groupId !== uid));
  };

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverIndex.current = index;
  };

  const handleDrop = () => {
    if (dragIndex.current === null || dragOverIndex.current === null) return;
    const newTopLevel = [...topLevelFields];
    const dragged = newTopLevel.splice(dragIndex.current, 1)[0];
    newTopLevel.splice(dragOverIndex.current, 0, dragged);
    const reordered = newTopLevel.map((f, i) => ({ ...f, order: i }));
    setFields((prev) => [...reordered, ...prev.filter((f) => f.groupId)]);
    dragIndex.current = null;
    dragOverIndex.current = null;
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch(`http://localhost:3000/forms/${form.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ name, fields }),
    });
    setSaving(false);
    onBack();
  };

  const regularTypes = FIELD_TYPES.filter((ft) => ft.group !== 'db');
  const dbTypes = FIELD_TYPES.filter((ft) => ft.group === 'db');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-xl font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition"
          />
        </div>
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${preview ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          {preview ? <EyeOff size={16} /> : <Eye size={16} />}
          {preview ? 'Редактор' : 'Предпросмотр'}
        </button>
      </div>
      {preview ? (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-6">{name}</h2>
          <FormPreview fields={fields} />
          <button type="button" className="mt-6 w-full py-3 bg-gray-800 text-white rounded-md text-sm">
            Сохранить анкету
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-5 h-fit">
            <p className="text-sm font-medium text-gray-500 mb-3">Добавить элемент</p>
            <div className="flex flex-col gap-1">
              {regularTypes.map((ft) => (
                <button
                  key={ft.type}
                  type="button"
                  onClick={() => addField(ft.type)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition
                    ${ft.type === 'group' ? 'text-purple-700 hover:bg-purple-50' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}
                  `}
                >
                  + {ft.label}
                </button>
              ))}
              <div className="border-t border-gray-100 my-2" />
              <p className="text-xs text-gray-400 px-3 mb-1">Из базы данных</p>
              {dbTypes.map((ft) => (
                <button
                  key={ft.type}
                  type="button"
                  onClick={() => addField(ft.type)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm transition text-green-700 hover:bg-green-50"
                >
                  + {ft.label}
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 flex flex-col gap-4">
            {topLevelFields.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">
                Добавьте элементы из панели слева
              </div>
            )}
            {topLevelFields.map((field, index) => (
              <div
                key={field.uid}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={handleDrop}
                className="cursor-grab active:cursor-grabbing"
              >
                <FieldCard
                  field={field}
                  updateField={updateField}
                  removeField={removeField}
                  addFieldToGroup={addFieldToGroup}
                  fields={fields}
                />
              </div>
            ))}
            {fields.filter((f) => !f.groupId).length > 0 && (
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? 'Сохранение...' : 'Сохранить форму'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
