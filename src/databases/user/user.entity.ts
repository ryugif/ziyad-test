import { Exclude, classToPlain } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseModel } from '../base.model';
import { BookTransaction } from '../book/book-transaction.entity';

@Entity('user')
export class User extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 300, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 300 })
  password: string;

  @OneToMany(() => BookTransaction, (transaction) => transaction.user)
  transactions: BookTransaction[];

  toJSON() {
    return classToPlain(this);
  }
}
