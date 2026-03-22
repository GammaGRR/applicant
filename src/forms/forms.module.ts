import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form } from './entities/form.entity';
import { FormField } from './entities/form-field.entity';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Form, FormField])],
  providers: [FormsService],
  controllers: [FormsController],
})
export class FormsModule {}