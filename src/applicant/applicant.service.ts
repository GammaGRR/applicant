import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Applicant } from './entities/applicant.entity';

type DocStatusFilter = 'Оригинал' | 'Копия';

@Injectable()
export class ApplicantsService {
  constructor(
    @InjectRepository(Applicant)
    private readonly applicantRepository: Repository<Applicant>,
  ) {}

  private parseCsvList(v: unknown): string[] {
    if (v === undefined || v === null) return [];
    const s = String(v).trim();
    if (!s) return [];
    return s
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  }

  private parseDocStatusList(v: unknown): DocStatusFilter[] {
    const items = this.parseCsvList(v);
    const allowed = new Set<DocStatusFilter>(['Оригинал', 'Копия']);
    return items.filter((x): x is DocStatusFilter => allowed.has(x as DocStatusFilter));
  }

  private parseBenefits(value: unknown): string[] {
    if (value === undefined || value === null) return [];
    if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
    const s = String(value)
      .trim()
      .replace(/^\[|\]$/g, '')
      .replace(/^["']|["']$/g, '');
    if (!s) return [];
    return s
      .split(/[,;/\n]+/)
      .map((x) => x.trim().replace(/^["']|["']$/g, ''))
      .map((x) => x.replace(/\s+/g, ' '))
      .filter(Boolean);
  }

  async findAll(query: Record<string, any>): Promise<Applicant[] | { items: Applicant[]; total: number }> {
    const pageRaw = query?.page;
    const limitRaw = query?.limit;

    const page = pageRaw !== undefined ? Math.max(1, parseInt(String(pageRaw), 10) || 1) : undefined;
    const limit = limitRaw !== undefined ? Math.min(1000, Math.max(1, parseInt(String(limitRaw), 10) || 50)) : undefined;
    const shouldPaginate = page !== undefined || limit !== undefined;

    const qb = this.applicantRepository.createQueryBuilder('applicant');
    qb.orderBy('applicant.createdAt', 'DESC');

    const search = String(query?.search ?? query?.query ?? '').trim();
    if (search) {
      qb.andWhere(
        '(applicant."caseNumber" ILIKE :search OR applicant."fullName" ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const caseNumbers = this.parseCsvList(query?.caseNumber);
    if (caseNumbers.length) {
      qb.andWhere('applicant."caseNumber" IN (:...caseNumbers)', { caseNumbers });
    }

    const fullNames = this.parseCsvList(query?.fullName);
    if (fullNames.length) {
      qb.andWhere('applicant."fullName" IN (:...fullNames)', { fullNames });
    }

    const classes = this.parseCsvList(query?.classes);
    if (classes.length) {
      qb.andWhere('applicant."classes" IN (:...classes)', { classes });
    }

    const professions = this.parseCsvList(query?.profession);
    if (professions.length) {
      qb.andWhere('applicant."profession" IN (:...professions)', { professions });
    }

    const finances = this.parseCsvList(query?.finance);
    if (finances.length) {
      qb.andWhere('applicant."finance" IN (:...finances)', { finances });
    }

    const pointsRaw = this.parseCsvList(query?.point);
    const points = pointsRaw
      .map((x) => Number(String(x).replace(',', '.')))
      .filter((n) => Number.isFinite(n));
    if (points.length) {
      qb.andWhere('applicant."point" IN (:...points)', { points });
    }

    const benefitTokens = this.parseBenefits(query?.benefit);
    if (benefitTokens.length) {
      qb.andWhere(
        `(${benefitTokens
          .map((_, i) => `applicant."benefit" ILIKE :b${i}`)
          .join(' OR ')})`,
        Object.fromEntries(benefitTokens.map((b, i) => [`b${i}`, `%${b}%`])),
      );
    }

    const docStatuses = this.parseDocStatusList(query?.docStatus);
    if (docStatuses.length) {
      // Rule: filter only by attestation original/copy via document name + done status.
      // OR semantics when multiple selected.
      const parts: string[] = [];
      const params: Record<string, any> = {};

      for (let i = 0; i < docStatuses.length; i++) {
        const st = docStatuses[i];
        const wantOriginal = st === 'Оригинал';
        parts.push(
          `EXISTS (
            SELECT 1
            FROM jsonb_array_elements(COALESCE(applicant."documents", '[]'::jsonb)) AS elem
            WHERE elem->>'status' = 'done'
              AND (elem->>'name') ILIKE :attest${i}
              AND (elem->>'name') ILIKE :kind${i}
          )`,
        );
        params[`attest${i}`] = '%аттестат%';
        params[`kind${i}`] = wantOriginal ? '%оригинал%' : '%копи%';
      }

      qb.andWhere(`(${parts.join(' OR ')})`, params);
    }

    if (shouldPaginate) {
      const take = limit ?? 50;
      const skip = ((page ?? 1) - 1) * take;
      qb.take(take).skip(skip);
      const [items, total] = await qb.getManyAndCount();
      return { items, total };
    }

    return qb.getMany();
  }

  async findOne(id: number): Promise<Applicant | null> {
    return this.applicantRepository.findOne({ where: { id } });
  }

  async create(data: {
    caseNumber?: string;
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
    checkedDocuments?: string[];
  }): Promise<Applicant> {
    const { checkedDocuments: _, ...saveData } = data;
    const applicant = this.applicantRepository.create(saveData);
    return this.applicantRepository.save(applicant);
  }

  async update(id: number, data: Partial<Applicant> & { checkedDocuments?: string[] }): Promise<Applicant | null> {
    const { checkedDocuments: _, ...saveData } = data;
    await this.applicantRepository.update(id, saveData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.applicantRepository.delete(id);
  }

  async clearAll(): Promise<void> {
    await this.applicantRepository.clear();
  }

  async getFilterOptions(): Promise<Record<string, string[]>> {
    const qb = this.applicantRepository.createQueryBuilder('applicant');
    qb.select([
      'applicant.caseNumber AS "caseNumber"',
      'applicant.fullName AS "fullName"',
      'applicant.classes AS "classes"',
      'applicant.profession AS "profession"',
      'applicant.finance AS "finance"',
      'applicant.point AS "point"',
      'applicant.benefit AS "benefit"',
    ]);

    const rows = await qb.getRawMany<{
      caseNumber: string | null;
      fullName: string | null;
      classes: string | null;
      profession: string | null;
      finance: string | null;
      point: number | null;
      benefit: string | null;
    }>();

    const uniq = (arr: string[]) => Array.from(new Set(arr.map((x) => x.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'ru'));

    const ids = uniq(rows.map((r) => r.caseNumber ?? '').filter(Boolean));
    const fullName = uniq(rows.map((r) => r.fullName ?? '').filter(Boolean));
    const classes = uniq(rows.map((r) => r.classes ?? '').filter(Boolean));
    const profession = uniq(rows.map((r) => r.profession ?? '').filter(Boolean));
    const finance = uniq(rows.map((r) => r.finance ?? '').filter(Boolean));
    const point = uniq(
      rows
        .map((r) => (r.point === null || r.point === undefined ? '' : String(r.point)))
        .filter(Boolean),
    );
    const benefit = uniq(
      rows.flatMap((r) => this.parseBenefits(r.benefit)),
    );

    return {
      id: ids,
      docStatus: ['Оригинал', 'Копия'],
      fullName,
      classes,
      profession,
      finance,
      point,
      benefit,
    };
  }

  async getStats(): Promise<{
    grade9_budget_total: number;
    grade9_budget_attest_original: number;
    grade9_commerce_total: number;
    grade11_budget_total: number;
    grade11_budget_attest_original: number;
    grade11_commerce_total: number;
  }> {
    const isBudget = `LOWER(COALESCE(applicant."finance",''))
      LIKE '%бюджет%'`;
    const isCommerce = `LOWER(COALESCE(applicant."finance",''))
      LIKE '%коммер%'`;

    const isGrade9 = `COALESCE(applicant."classes",'') LIKE '%9%'`;
    const isGrade11 = `COALESCE(applicant."classes",'') LIKE '%11%'`;

    const hasAttestOriginal = `EXISTS (
      SELECT 1
      FROM jsonb_array_elements(COALESCE(applicant."documents", '[]'::jsonb)) AS elem
      WHERE elem->>'status' = 'done'
        AND (elem->>'name') ILIKE '%аттестат%'
        AND (elem->>'name') ILIKE '%оригинал%'
    )`;

    const rows = await this.applicantRepository
      .createQueryBuilder('applicant')
      .select([
        `COUNT(*) FILTER (WHERE ${isGrade9} AND ${isBudget})::int AS "grade9_budget_total"`,
        `COUNT(*) FILTER (WHERE ${isGrade9} AND ${isBudget} AND ${hasAttestOriginal})::int AS "grade9_budget_attest_original"`,
        `COUNT(*) FILTER (WHERE ${isGrade9} AND ${isCommerce})::int AS "grade9_commerce_total"`,
        `COUNT(*) FILTER (WHERE ${isGrade11} AND ${isBudget})::int AS "grade11_budget_total"`,
        `COUNT(*) FILTER (WHERE ${isGrade11} AND ${isBudget} AND ${hasAttestOriginal})::int AS "grade11_budget_attest_original"`,
        `COUNT(*) FILTER (WHERE ${isGrade11} AND ${isCommerce})::int AS "grade11_commerce_total"`,
      ])
      .getRawOne<{
        grade9_budget_total: number;
        grade9_budget_attest_original: number;
        grade9_commerce_total: number;
        grade11_budget_total: number;
        grade11_budget_attest_original: number;
        grade11_commerce_total: number;
      }>();

    return {
      grade9_budget_total: Number(rows?.grade9_budget_total ?? 0),
      grade9_budget_attest_original: Number(rows?.grade9_budget_attest_original ?? 0),
      grade9_commerce_total: Number(rows?.grade9_commerce_total ?? 0),
      grade11_budget_total: Number(rows?.grade11_budget_total ?? 0),
      grade11_budget_attest_original: Number(rows?.grade11_budget_attest_original ?? 0),
      grade11_commerce_total: Number(rows?.grade11_commerce_total ?? 0),
    };
  }
}