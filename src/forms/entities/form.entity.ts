import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { FormField } from './form-field.entity';

@Entity('forms')
export class Form {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => FormField, (field) => field.form, {
    cascade: true,
    eager: true,
  })
  fields: FormField[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isActive: boolean;
}
