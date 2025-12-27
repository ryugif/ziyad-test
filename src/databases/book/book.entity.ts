import { Exclude, classToPlain } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseModel } from '../base.model';
import { BookTransaction } from './book-transaction.entity';

@Entity('book')
export class Book extends BaseModel {
  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  author: string | null;

  @Column({ type: 'date', nullable: true, name: 'published_date' })
  publishedDate: Date | null;

  @Column({ type: 'int' })
  stock: number;

  @OneToMany(() => BookTransaction, (transaction) => transaction.book)
  transactions: BookTransaction[];

  toJSON() {
    return classToPlain(this);
  }
}
