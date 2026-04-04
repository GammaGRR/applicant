import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, FileText } from 'lucide-react';
import type { ActiveForm, FormField } from './types';
import { extractQuickFields } from './extractQuickFields';
import { ApplicantFormContent } from './ApplicantFormContent';

export const ApplicantForm = ({ onCreated }: { onCreated?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeForm, setActiveForm] = useState<ActiveForm | null>(null);
  const [caseNumber, setCaseNumber] = useState('');
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('http://localhost:3000/forms/active')
      .then((r) => r.json())
      .then((data) => {
        setActiveForm(data);
        if (data?.fields) {
          const initial: Record<string, unknown> = {};
          (data.fields as FormField[]).forEach((f) => {
            if (f.type === 'checkbox') initial[f.id] = f.options?.length > 0 ? [] : false;
            else if (f.type === 'person')
              initial[f.id] = {
                lastName: '',
                firstName: '',
                middleName: '',
                address: '',
                phone: '',
                workplace: '',
                position: '',
              };
            else if (f.type === 'gpa') initial[f.id] = { n2: '', n3: '', n4: '', n5: '' };
            else if (f.type === 'documents') initial[f.id] = { selected: [], counts: {} };
            else initial[f.id] = '';
          });
          setValues(initial);
        }
      })
      .catch(() => {});
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
      setError(null);
      setCaseNumber('');
    }, 150);
  };

  const handleSave = async () => {
    if (!activeForm) return;
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const quick = extractQuickFields(activeForm.fields, values);
      let documents: { name: string; status: 'done' | 'missing'; count?: number }[] = [];
      try {
        const docsRes = await fetch('http://localhost:3000/documents');
        const allDocs = await docsRes.json();
        const allDocNames: string[] = allDocs.map((d: { name: string }) => d.name);
        documents = allDocNames.map((name) => {
          const done = quick.checkedDocuments.includes(name);
          const count = done ? quick.documentCounts?.[name] : undefined;
          return {
            name,
            status: done ? 'done' : 'missing',
            ...(count && count > 0 ? { count } : {}),
          };
        });
      } catch {}

      const response = await fetch('http://localhost:3000/applicants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          caseNumber,
          formData: values,
          formId: activeForm.id,
          ...quick,
          documents,
        }),
      });
      if (!response.ok) throw new Error();
      handleClose();
      onCreated?.();
    } catch {
      setError('Не удалось сохранить анкету. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-gray-900 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-black transition"
      >
        <Plus size={16} /> Добавить абитуриента
      </button>
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            onClick={handleClose}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl ${isClosing ? 'animate-fade-out-scale' : 'animate-fade-in-scale'}`}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3 z-10">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <FileText size={20} className="text-blue-600" />
                  {activeForm?.name ?? 'Анкета абитуриента'}
                </h2>
                <button type="button" onClick={handleClose} className="p-2 rounded-full hover:bg-gray-200">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                {!activeForm && (
                  <p className="text-gray-400 text-sm text-center py-8">
                    Активная форма не выбрана. Создайте форму в админ панели.
                  </p>
                )}
                {activeForm && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        № дела <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={caseNumber}
                        onChange={(e) => setCaseNumber(e.target.value)}
                        placeholder="Например: 1/9 ИС"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <ApplicantFormContent form={activeForm} values={values} setValues={setValues} />
                  </>
                )}
                {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}
                {activeForm && (
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="mt-6 w-full py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-md disabled:opacity-50 transition"
                  >
                    {saving ? 'Сохранение...' : 'Сохранить анкету'}
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
