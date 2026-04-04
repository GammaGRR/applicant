import {
  Controller, Get, Post, Delete,
  Body, Param, UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { SpecialitiesService } from './specialty.service';
import { ApplicantsService } from '../applicant/applicant.service';
import { SpecialtiesStatsService } from '../stats/specialties-stats.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

export class CreateSpecialityDto {
  name: string;
  code?: string;
  description?: string;
  budgetPlaces?: number;
  contractPlaces?: number;
  [key: string]: any;
}

@Controller('specialities')
export class SpecialitiesController {
  constructor(
    private readonly specialitiesService: SpecialitiesService,
    private readonly applicantsService: ApplicantsService,
    private readonly statsService: SpecialtiesStatsService,
  ) {}

  @Get()
  findAll() {
    return this.specialitiesService.findAll();
  }

  @Get('stats')
  async getStats() {
    const specialities = await this.specialitiesService.findAll();
    const result = await this.applicantsService.findAll({});
    const applicants = Array.isArray(result) ? result : result.items;
    return this.statsService.buildStats(specialities, applicants);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('dev', 'admin')
  create(@Body() body: CreateSpecialityDto) {
    return this.specialitiesService.create(body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('dev', 'admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.specialitiesService.remove(id);
  }
}