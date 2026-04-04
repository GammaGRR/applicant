export interface SpecialtyStatRow {
  code: string;
  name: string;
  plan: number;
  budgetPlaces: number;
  paidPlaces: number;
  submitted: number;
  originals: number;
  copies: number;
  avgScore: number | null;
  benefit: number;
  minScoreOrig: number | null;
  minScoreCopy: number | null;
}

export interface StatsResponse {
  totalSeats: number;
  totalApplications: number;
  withOriginals: number;
  withBenefits: number;
  specialties: SpecialtyStatRow[];
}

export interface StatApplicant {
  id: number;
  caseNumber: string;
  fullName: string;
  profession: string;
  finance: string;
  point: number | null;
  benefit: string;
  documents?: { name: string; status: string }[];
}

export type SortKey =
  | 'plan'
  | 'submitted'
  | 'originals'
  | 'copies'
  | 'avgScore'
  | 'benefit'
  | 'minScoreOrig'
  | 'minScoreCopy';

export type StatColor = 'blue' | 'green' | 'violet' | 'amber';
