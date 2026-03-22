import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Form } from './entities/form.entity';
import { FormField } from './entities/form-field.entity';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Form)
    private readonly formRepository: Repository<Form>,
    @InjectRepository(FormField)
    private readonly fieldRepository: Repository<FormField>,
  ) { }

  async findAll(): Promise<Form[]> {
    return this.formRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Form> {
    const form = await this.formRepository.findOne({ where: { id } });
    if (!form) throw new NotFoundException('Форма не найдена');
    return form;
  }

  async create(name: string): Promise<Form> {
    const form = this.formRepository.create({ name });
    return this.formRepository.save(form);
  }

  async update(
    id: number,
    name: string,
    fields: Partial<FormField>[],
  ): Promise<Form> {
    const form = await this.findOne(id);
    form.name = name;
    await this.fieldRepository.delete({ formId: id });
    form.fields = fields.map((f, index) =>
      this.fieldRepository.create({ ...f, formId: id, order: index }),
    );
    return this.formRepository.save(form);
  }

  async remove(id: number): Promise<void> {
    await this.formRepository.delete(id);
  }

  async setActive(id: number): Promise<Form> {
    await this.formRepository
      .createQueryBuilder()
      .update(Form)
      .set({ isActive: false })
      .where('id != :id', { id })
      .execute();

    await this.formRepository.update(id, { isActive: true });
    return this.findOne(id);
  }

  async getActive(): Promise<Form | null> {
    return this.formRepository.findOne({ where: { isActive: true } });
  }
}
