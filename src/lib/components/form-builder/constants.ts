import { DEFAULT_PERSON_FIELDS } from '../elements/PersonSection';
import type { FieldType, FormBuilderField } from './types';

export const FIELD_TYPES: { type: FieldType; label: string; group?: string }[] = [
  { type: 'heading', label: 'Заголовок раздела' },
  { type: 'group', label: 'Группа полей' },
  { type: 'text', label: 'Текст' },
  { type: 'textarea', label: 'Многострочный текст' },
  { type: 'phone', label: 'Телефон' },
  { type: 'radio', label: 'Радио кнопки' },
  { type: 'checkbox', label: 'Чекбокс' },
  { type: 'select', label: 'Выпадающий список' },
  { type: 'gpa', label: 'Средний балл (калькулятор)' },
  { type: 'person', label: 'Информация о персоне' },
  { type: 'specialty', label: 'Специальность (из БД)', group: 'db' },
  { type: 'benefit', label: 'Льгота (из БД)', group: 'db' },
  { type: 'documents', label: 'Документы (из БД)', group: 'db' },
];

export const COL_OPTIONS = [
  { value: 1, label: '1/3' },
  { value: 2, label: '1/2' },
  { value: 3, label: 'Полная' },
];

export const NO_GROUP_TYPES: FieldType[] = [
  'heading',
  'group',
  'person',
  'specialty',
  'benefit',
  'documents',
];

export const getColClass = (cols: number) => {
  if (cols === 1) return 'col-span-1';
  if (cols === 2) return 'col-span-2';
  return 'col-span-3';
};

export const emptyField = (
  type: FieldType,
  order: number,
  groupId: string | null = null,
): FormBuilderField => ({
  uid: crypto.randomUUID(),
  type,
  label: '',
  placeholder: '',
  required: false,
  options: type === 'person' ? [...DEFAULT_PERSON_FIELDS] : [],
  order,
  cols: 3,
  isGroup: type === 'group',
  groupId,
  direction: 'row',
  isApplicant: false,
});
