export type FieldType =
  | 'text'
  | 'textarea'
  | 'phone'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'gpa'
  | 'heading'
  | 'person'
  | 'group'
  | 'specialty'
  | 'benefit'
  | 'documents';

export interface FormField {
  id: number;
  type: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
  order: number;
  cols: number;
  isGroup: boolean;
  groupId: string | null;
  direction?: 'row' | 'col';
  isApplicant?: boolean;
}

export interface ActiveForm {
  id: number;
  name: string;
  fields: FormField[];
}
