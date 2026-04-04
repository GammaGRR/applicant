import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SpecialtiesStatsService {
  private readonly logger = new Logger(SpecialtiesStatsService.name);

  private normalize(str?: string): string {
    return (str || '').toLowerCase().trim().replace(/\s+/g, ' ');
  }

  private isOriginal(doc: any): boolean {
    const name = (doc?.name || '').toLowerCase();
    const statusOk = !doc?.status || ['done', 'verified', 'approved', 'confirmed'].includes(doc.status);
    return statusOk && name.includes('аттестат') && (name.includes('ориг') || name.includes('оригинал'));
  }

  private isCopy(doc: any): boolean {
    const name = (doc?.name || '').toLowerCase();
    const statusOk = !doc?.status || ['done', 'verified', 'approved', 'confirmed'].includes(doc.status);
    return statusOk && name.includes('аттестат') && (name.includes('копия') || name.includes('копи'));
  }

  // ✅ Льготы: только "СВО"
  private hasSvoBenefit(benefit: any): boolean {
    if (!benefit) return false;
    const str = String(benefit).toLowerCase().trim();
    return str === 'сво' || str === 'сво.' || str.includes('специальная военная операция');
  }

  // ✅ Парсер балла
  private parsePoint(val: any): number | null {
    if (val === null || val === undefined) return null;
    if (typeof val === 'number') {
      if ((val >= 2 && val <= 5.01) || (val >= 50 && val <= 300)) return isFinite(val) ? val : null;
      return null;
    }
    if (typeof val === 'string') {
      const cleaned = val.replace(',', '.').trim();
      const match = cleaned.match(/(\d+\.?\d*)/);
      if (match) {
        const num = Number(match[1]);
        if ((num >= 2 && num <= 5.01) || (num >= 50 && num <= 300)) return num;
      }
    }
    if (typeof val === 'object' && val !== null) {
      const priorityKeys = ['value', 'score', 'points', 'grade', 'балл', 'сумма', 'total', 'result', 'average', 'avg'];
      for (const key of priorityKeys) {
        if (val[key] !== undefined) {
          const found = this.parsePoint(val[key]);
          if (found !== null) return found;
        }
      }
      for (const k of Object.keys(val)) {
        if (['id', 'fieldId', 'formId', 'key', 'index', 'order'].includes(k)) continue;
        const found = this.parsePoint(val[k]);
        if (found !== null) return found;
      }
    }
    return null;
  }

  private extractPointFromFormData(formData: any): number | null {
    if (!formData || typeof formData !== 'object') return null;
    for (const key of Object.keys(formData)) {
      const found = this.parsePoint(formData[key]);
      if (found !== null) return found;
    }
    return null;
  }

  private calculateAverage(scores: number[]): number | null {
    if (scores.length === 0) return null;
    const sum = scores.reduce((a, b) => a + b, 0);
    return Number((sum / scores.length).toFixed(2));
  }

  private safeMin(numbers: number[]): number | null {
    if (numbers.length === 0) return null;
    const m = Math.min(...numbers);
    return isFinite(m) ? m : null;
  }

  buildStats(specialities: any[], applicants: any[]) {
    this.logger.log(`Building stats: ${specialities.length} specialties, ${applicants.length} applicants`);

    return {
      // ✅ Только бюджетные места
      totalSeats: specialities.reduce((sum, s) => sum + (s.budgetPlaces ?? 0), 0),
      totalApplications: applicants.length,
      withOriginals: applicants.filter(a => a.documents?.some((d: any) => this.isOriginal(d))).length,
      withBenefits: applicants.filter(a => this.hasSvoBenefit(a.benefit)).length,

      specialties: specialities.map(spec => {
        const plan = spec.budgetPlaces ?? 0; // ✅ Только бюджет
        const code = this.normalize(spec.code);
        const name = this.normalize(spec.name);

        const specApplicants = applicants.filter(a => {
          const prof = this.normalize(a.profession ?? a.speciality ?? '');
          return (code && prof.includes(code)) || (name && prof.includes(name));
        });

        // 📊 Средний балл по всем
        const allScores = specApplicants
          .map(a => this.parsePoint(a.point) ?? this.extractPointFromFormData(a.formData))
          .filter((s): s is number => s !== null);
        const avgScore = this.calculateAverage(allScores);

        // 📋 Оригинал
        const origApplicants = specApplicants.filter(a => a.documents?.some((d: any) => this.isOriginal(d)));
        const origScores = origApplicants
          .map(a => this.parsePoint(a.point) ?? this.extractPointFromFormData(a.formData))
          .filter((s): s is number => s !== null);
        const minScoreOrig = this.safeMin(origScores);

        // 📋 Копия
        const copyApplicants = specApplicants.filter(a => a.documents?.some((d: any) => this.isCopy(d)));
        const copyScores = copyApplicants
          .map(a => this.parsePoint(a.point) ?? this.extractPointFromFormData(a.formData))
          .filter((s): s is number => s !== null);
        const minScoreCopy = this.safeMin(copyScores);

        // 🎁 СВО
        const svoCount = specApplicants.filter(a => this.hasSvoBenefit(a.benefit)).length;

        // 🔍 Логирование
        if (specApplicants.length > 0) {
          this.logger.debug(`[${spec.code}] ${spec.name}: budgetPlan=${plan}, avg=${avgScore}, minOrig=${minScoreOrig}, minCopy=${minScoreCopy}, svo=${svoCount}`);
        }

        return {
          code: spec.code,
          name: spec.name,
          plan, // ✅ Только бюджет
          budgetPlaces: spec.budgetPlaces ?? 0,
          paidPlaces: spec.paidPlaces ?? 0, // оставляем для отображения, но не используем в расчётах
          submitted: specApplicants.length,
          originals: origApplicants.length,
          copies: copyApplicants.length,
          avgScore: avgScore && isFinite(avgScore) ? avgScore : null,
          benefit: svoCount,
          minScoreOrig: minScoreOrig && isFinite(minScoreOrig) ? minScoreOrig : null,
          minScoreCopy: minScoreCopy && isFinite(minScoreCopy) ? minScoreCopy : null,
        };
      }),
    };
  }
}