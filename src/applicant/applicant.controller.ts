import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApplicantsService } from './applicant.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@Controller('applicants')
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('dev', 'admin', 'user')
  findAll() {
    return this.applicantsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('dev', 'admin', 'user')
  findOne(@Param('id') id: number) {
    return this.applicantsService.findOne(id);
  }

  @Post()
  create(@Body() body: {
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
  }) {
    return this.applicantsService.create(body);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('dev', 'admin')
  update(@Param('id') id: number, @Body() body: any) {
    return this.applicantsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('dev', 'admin')
  remove(@Param('id') id: number) {
    return this.applicantsService.remove(id);
  }
}