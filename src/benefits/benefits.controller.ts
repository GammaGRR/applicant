import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BenefitsService } from './benefits.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@Controller('benefits')
export class BenefitsController {
  constructor(private readonly benefitsService: BenefitsService) { }

  @Get()
  findAll() {
    return this.benefitsService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('dev', 'admin')
  create(@Body() body: Partial<any>) {
    return this.benefitsService.create(body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('dev', 'admin')
  remove(@Param('id') id: number) {
    return this.benefitsService.remove(id);
  }
}