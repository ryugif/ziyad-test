/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from '../../databases/book/book.entity';
import { In, IsNull, Repository } from 'typeorm';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { BookTransaction } from '../../databases/book/book-transaction.entity';
import { ReturnBookDto } from './dto/return-book.dto';
import dayjs from 'dayjs';

@Injectable()
export class BorrowService {
  private readonly logger = new Logger(BorrowService.name);

  constructor(
    @InjectRepository(Book)
    private repository: Repository<Book>,
  ) {}

  async borrowBook(payload: BorrowBookDto, userId: number) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const data = payload.books.map((book) => ({
        book: { id: book.id },
        user: { id: userId },
        quantity: book.quantity,
        borrowedDate: payload.borrowed_date,
        dueDate: dayjs(payload.borrowed_date)
          .add(payload.due_days, 'day')
          .toDate(),
      }));

      const book = queryRunner.manager
        .getRepository(BookTransaction)
        .create(data);

      const savedTransaction = await queryRunner.manager
        .getRepository(BookTransaction)
        .save(book);

      // reduce book stock
      for (const book of payload.books) {
        await queryRunner.manager
          .getRepository(Book)
          .decrement({ id: book.id }, 'stock', book.quantity);
      }

      await queryRunner.commitTransaction();
      this.logger.log(
        `Borrowed ${savedTransaction.length} books for user id: ${userId}`,
      );
      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create book: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async returnBook(payload: ReturnBookDto, userId: number) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const findTransaction = await queryRunner.manager
        .getRepository(BookTransaction)
        .find({
          where: {
            book: { id: In(payload.books.map((book) => book.id)) },
            user: { id: userId },
            returnedDate: IsNull(),
          },
          relations: ['book', 'user'],
        });

      for (const book of payload.books) {
        const transaction = findTransaction.find(
          (tx) => tx.book.id === book.id,
        );
        if (transaction) {
          transaction.returnedDate = new Date();
          transaction.quantity = book.quantity;
          transaction.status =
            book.quantity < transaction.quantity
              ? 'partially_returned'
              : 'returned';

          await queryRunner.manager
            .getRepository(Book)
            .increment({ id: book.id }, 'stock', book.quantity);

          await queryRunner.manager
            .getRepository(BookTransaction)
            .save(transaction);
        }
      }

      const updatedTransaction = await queryRunner.manager
        .getRepository(BookTransaction)
        .find({
          where: {
            book: { id: In(payload.books.map((book) => book.id)) },
            user: { id: userId },
          },
        });
      await queryRunner.commitTransaction();
      this.logger.log(
        `Returned ${updatedTransaction.length} books for user id: ${userId}`,
      );
      return updatedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to return ${payload.books.length} books: ${error.message}`,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getBorrowedTransactions(userId: number, bookIds: number[]) {
    return this.repository.manager.getRepository(BookTransaction).find({
      where: {
        book: { id: In(bookIds) },
        user: { id: userId },
        returnedDate: IsNull(),
      },
      relations: ['book', 'user'],
    });
  }

  async getAllTransactionsByUser(userId: number) {
    return this.repository.manager.getRepository(BookTransaction).find({
      where: {
        user: { id: userId },
      },
      relations: ['book'],
    });
  }
}
