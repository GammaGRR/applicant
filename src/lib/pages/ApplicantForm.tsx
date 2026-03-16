import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { FormState, PersonInfo } from '../types/formTypes';
import { PROFESSIONS, MAIN_DOCS, COPY_DOCS } from '../constants/formData';
import { TextInput } from '../components/elements/TextInput';
import { TextArea } from '../components/elements/TextArea';
import { Select } from '../components/elements/Select';
import { Checkbox } from '../components/elements/CheckBox';
import { RadioGroup } from '../components/elements/RadioGroup';
import { Field } from '../components/Field';
import { SectionHeader } from '../components/SectionHeader';
import PersonSection from '../components/PersonSection';
import { LogOut, FileText } from 'lucide-react';

const emptyPerson = (): PersonInfo => ({
  lastName: '',
  firstName: '',
  middleName: '',
  address: '',
  phone: '',
  workplace: '',
  position: '',
});

export const ApplicantForm = () => {
  const [form, setForm] = useState<FormState>({
    caseNumber: '',
    lastName: '',
    firstName: '',
    middleName: '',
    address: '',
    classCount: '',
    profession: '',

    cert9: false,
    cert11: false,
    diplomaProfessional: false,
    needsDorm: false,

    mother: emptyPerson(),
    father: emptyPerson(),

    note: '',

    docs: Object.fromEntries(MAIN_DOCS.map((d) => [d, false])),
    copyDocs: Object.fromEntries(COPY_DOCS.map((d) => [d, false])),
  });

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
  };

  const updatePerson = (
    parent: 'mother' | 'father',
    field: keyof PersonInfo,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const handleSave = () => {
    alert('Анкета сохранена!');
    console.log(form);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
            <FileText size={32} className="text-blue-600" />
            Анкета абитуриента
          </h1>
          <Link
            to="/Dashboard"
            className="bg-gray-100 text-sm border border-gray-200 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Выйти
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <section className="mb-6">
            <SectionHeader title="Основная информация" />
            <Field label="№ дела" required>
              <TextInput
                value={form.caseNumber}
                onChange={(v) => setField('caseNumber', v)}
              />
            </Field>
            <section className="mb-6">
              <SectionHeader title="Предоставленные документы" />
              <div className="space-y-2 mb-4">
                {MAIN_DOCS.map((doc) => (
                  <Checkbox
                    key={doc}
                    label={doc}
                    checked={form.docs[doc]}
                    onChange={(v) =>
                      setField('docs', { ...form.docs, [doc]: v })
                    }
                  />
                ))}
              </div>
              <div className="space-y-2">
                {COPY_DOCS.map((doc) => (
                  <Checkbox
                    key={doc}
                    label={doc}
                    checked={form.copyDocs[doc]}
                    onChange={(v) =>
                      setField('copyDocs', { ...form.copyDocs, [doc]: v })
                    }
                  />
                ))}
              </div>
            </section>
            <Field label="Примечание">
              <TextArea
                value={form.note}
                onChange={(v) => setField('note', v)}
              />
            </Field>
            <Field label="Количество классов обучения" required>
              <RadioGroup
                options={[
                  { label: '9 классов', value: '9' },
                  { label: '11 классов', value: '11' },
                ]}
                value={form.classCount}
                onChange={(v) => setField('classCount', v)}
              />
            </Field>
            <Field label="Профессия">
              <Select
                options={PROFESSIONS}
                value={form.profession}
                onChange={(v) => setField('profession', v)}
              />
            </Field>
          </section>
          <section className="mb-6">
            <SectionHeader title="Образование" />
            <Field label="Наименование учебного заведения" required>
              <TextInput
                value={form.caseNumber}
                onChange={(v) => setField('caseNumber', v)}
              />
            </Field>
            <Checkbox
              label="Общежитие"
              checked={form.needsDorm}
              onChange={(v) => setField('needsDorm', v)}
            />
          </section>
          <PersonSection
            title="Информация о матери"
            data={form.mother}
            onChange={(f, v) => updatePerson('mother', f, v)}
          />
          <PersonSection
            title="Информация об отце"
            data={form.father}
            onChange={(f, v) => updatePerson('father', f, v)}
          />
          <button
            onClick={handleSave}
            className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-md transition"
          >
            Сохранить анкету
          </button>
        </div>
      </main>
    </div>
  );
};
