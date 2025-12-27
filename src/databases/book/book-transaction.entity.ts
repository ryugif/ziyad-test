import { Exclude, classToPlain } from 'class-transformer';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseModel } from '../base.model';
import { Book } from './book.entity';
import { User } from '../user/user.entity';

@Entity('book_transaction')
export class BookTransaction extends BaseModel {
  @ManyToOne(() => Book, (book) => book.transactions)
  book: Book;

  @ManyToOne(() => User, (user) => user.transactions)
  user: User;

  @Column({ type: 'date', name: 'borrowed_date' })
  borrowedDate: Date;

  @Column({ type: 'date', name: 'returned_date', nullable: true })
  returnedDate: Date | null;

  @Column({ type: 'date', name: 'due_date', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'int' })
  quantity: number;

  // e.g., 'borrowed', 'returned', 'lost'
  @Column({ type: 'varchar', length: 50, default: 'borrowed' })
  status: string;

  toJSON() {
    return classToPlain(this);
  }
}
