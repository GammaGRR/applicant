import type { DocumentItem } from '../../components/ApplicantDocument';

export interface Applicant {
  id: number;
  caseNumber: string;
  fullName: string;
  classes: string;
  profession: string;
  finance: string;
  point: number;
  benefit: string;
  note: string;
  formData: Record<string, unknown>;
  createdAt: string;
  documents: DocumentItem[];
}

export interface FilterState {
  docStatus: string[];
  classes: string[];
  profession: string[];
  finance: string[];
  point: string[];
  benefit: string[];
}
