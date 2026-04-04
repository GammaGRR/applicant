// Добавь этот метод в src/specialties/specialty.service.ts
// И заинжектируй Applicant репозиторий (см. ниже)

import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Speciality } from './entities/specialty.entity';
import { Applicant } from '../applicant/entities/applicant.entity';

@Injectable()
export class SpecialitiesService {
  constructor(
    @InjectRepository(Speciality)
    private readonly specialityRepository: Repository<Speciality>,
    @InjectRepository(Applicant)
    private readonly applicantRepository: Repository<Applicant>,
  ) {}

  async findAll(): Promise<Speciality[]> {
    return this.specialityRepository.find();
  }

  async create(data: Partial<Speciality>): Promise<Speciality> {
    const exists = await this.specialityRepository.findOne({
      where: { code: data.code },
    });
    if (exists) throw new ConflictException('Специальность с таким кодом уже существует');
    const speciality = this.specialityRepository.create(data);
    return this.specialityRepository.save(speciality);
  }

  async remove(id: number): Promise<void> {
    await this.specialityRepository.delete(id);
  }

  async getStats(): Promise<{
    totalSeats: number;
    totalApplications: number;
    withOriginals: number;
    withBenefits: number;
    specialties: SpecialtyStatRow[];
  }> {
    const specialities = await this.specialityRepository.find();

    // Все абитуриенты одним запросом
    const applicants = await this.applicantRepository.find();

    const totalSeats = specialities.reduce(
      (sum, s) => sum + (s.budgetPlaces ?? 0) + (s.paidPlaces ?? 0),
      0,
    );
    const totalApplications = applicants.length;
    const hasOriginal = (a: Applicant) =>
      Array.isArray(a.documents) &&
      a.documents.some(
        (d) =>
          d.status === 'done' &&
          d.name?.toLowerCase().includes('аттестат') &&
          d.name?.toLowerCase().includes('оригинал'),
      );

    const hasBenefit = (a: Applicant) =>
      !!a.benefit && a.benefit.trim() !== '' && a.benefit.trim().toLowerCase() !== 'нет';

    const withOriginals = applicants.filter(hasOriginal).length;
    const withBenefits = applicants.filter(hasBenefit).length;

    const specialties: SpecialtyStatRow[] = specialities.map((spec) => {
      // Матчим абитуриентов по profession (строка совпадает с name специальности)
      const specApplicants = applicants.filter(
        (a) => a.profession?.trim().toLowerCase() === spec.name?.trim().toLowerCase(),
      );

      const submitted = specApplicants.length;
      const originals = specApplicants.filter(hasOriginal).length;

      // Копии = есть аттестат с копией (не оригинал)
      const copies = specApplicants.filter((a) =>
        Array.isArray(a.documents) &&
        a.documents.some(
          (d) =>
            d.status === 'done' &&
            d.name?.toLowerCase().includes('аттестат') &&
            !d.name?.toLowerCase().includes('оригинал'),
        ),
      ).length;

      const benefit = specApplicants.filter(hasBenefit).length;
      const pointsArr = specApplicants
        .map((a) => a.point)
        .filter((p): p is number => p !== null && p !== undefined && !isNaN(p));
      const avgScore =
        pointsArr.length > 0
          ? Math.round((pointsArr.reduce((a, b) => a + b, 0) / pointsArr.length) * 100) / 100
          : null;
      const origPoints = specApplicants
        .filter(hasOriginal)
        .map((a) => a.point)
        .filter((p): p is number => p !== null && p !== undefined && !isNaN(p));
      const minScoreOrig = origPoints.length > 0 ? Math.min(...origPoints) : null;
      const copyPoints = specApplicants
        .filter((a) => !hasOriginal(a) && copies > 0)
        .map((a) => a.point)
        .filter((p): p is number => p !== null && p !== undefined && !isNaN(p));
      const minScoreCopy = copyPoints.length > 0 ? Math.min(...copyPoints) : null;

      return {
        code: spec.code,
        name: spec.name,
        plan: (spec.budgetPlaces ?? 0) + (spec.paidPlaces ?? 0),
        budgetPlaces: spec.budgetPlaces ?? 0,
        paidPlaces: spec.paidPlaces ?? 0,
        submitted,
        originals,
        copies,
        avgScore,
        benefit,
        minScoreOrig,
        minScoreCopy,
      };
    });

    return {
      totalSeats,
      totalApplications,
      withOriginals,
      withBenefits,
      specialties,
    };
  }
}

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