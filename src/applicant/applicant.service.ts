import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Applicant } from './entities/applicant.entity';

@Injectable()
export class ApplicantsService {
  constructor(
    @InjectRepository(Applicant)
    private readonly applicantRepository: Repository<Applicant>,
  ) {}

  async findAll(): Promise<Applicant[]> {
    return this.applicantRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Applicant | null> {
    return this.applicantRepository.findOne({ where: { id } });
  }

  async create(data: {
    formData: Record<string, any>;
    formId?: number;
    fullName?: string;
    classes?: string;
    profession?: string;
    finance?: string;
    point?: number;
    benefit?: string;
    note?: string;
    documents?: { name: string; status: 'done' | 'missing' }[];
  }): Promise<Applicant> {
    const count = await this.applicantRepository.count();
    const year = new Date().getFullYear();
    const caseNumber = `${count + 1}/${year}`;

    const applicant = this.applicantRepository.create({
      ...data,
      caseNumber,
    });
    return this.applicantRepository.save(applicant);
  }

  async update(id: number, data: Partial<Applicant>): Promise<Applicant | null> {
    await this.applicantRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.applicantRepository.delete(id);
  }
}