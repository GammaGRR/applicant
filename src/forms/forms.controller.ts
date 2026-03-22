import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { FormsService } from './forms.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Get('active')
  getActive() {
    return this.formsService.getActive();
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('dev', 'admin')
  findAll() {
    return this.formsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('dev', 'admin')
  findOne(@Param('id') id: number) {
    return this.formsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('dev', 'admin')
  create(@Body() body: { name: string }) {
    return this.formsService.create(body.name);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('dev', 'admin')
  update(@Param('id') id: number, @Body() body: { name: string; fields: any[] }) {
    return this.formsService.update(id, body.name, body.fields);
  }

  @Patch(':id/activate')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('dev', 'admin')
  activate(@Param('id') id: number) {
    return this.formsService.setActive(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('dev', 'admin')
  remove(@Param('id') id: number) {
    return this.formsService.remove(id);
  }
}