import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Applicant } from './entities/applicant.entity';
import { ApplicantsService } from './applicant.service';
import { ApplicantsController } from './applicant.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Applicant])],
    controllers: [ApplicantsController],
    providers: [ApplicantsService],
    exports: [ApplicantsService],
})
export class ApplicantsModule { }