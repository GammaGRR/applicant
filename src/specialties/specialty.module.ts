import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialitiesController } from './specialty.controller';
import { SpecialitiesService } from './specialty.service';
import { SpecialtiesStatsService } from '../stats/specialties-stats.service';
import { ApplicantsService } from '../applicant/applicant.service';
import { Speciality } from './entities/specialty.entity';
import { Applicant } from '../applicant/entities/applicant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Speciality, Applicant]),
  ],
  controllers: [SpecialitiesController],
  providers: [
    SpecialitiesService,
    ApplicantsService,
    SpecialtiesStatsService,
  ],
  exports: [SpecialitiesService],
})
export class SpecialitiesModule {}