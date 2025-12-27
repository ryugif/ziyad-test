import { Exclude, classToPlain } from 'class-transformer';
import { Column, Entity } from 'typeorm';
import { BaseModel } from '../base.model';

@Entity('user')
export class User extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 300, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 300 })
  password: string;

  toJSON() {
    return classToPlain(this);
  }
}
