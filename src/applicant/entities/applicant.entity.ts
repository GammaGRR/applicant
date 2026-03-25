import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('applicants')
export class Applicant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  caseNumber: string;

  @Column({ type: 'jsonb' })
  formData: Record<string, any>;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  classes: string;

  @Column({ nullable: true })
  profession: string;

  @Column({ nullable: true })
  finance: string;

  @Column({ type: 'float', nullable: true })
  point: number;

  @Column({ nullable: true })
  benefit: string;

  @Column({ nullable: true })
  note: string;

  @Column({ type: 'jsonb', nullable: true })
  documents: { name: string; status: 'done' | 'missing'; count?: number }[];

  @Column({ nullable: true })
  formId: number;

  @CreateDateColumn()
  createdAt: Date;
}