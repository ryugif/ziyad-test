/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Book } from '../../databases/book/book.entity';

@Injectable()
export class BookService {
  private readonly logger = new Logger(BookService.name);

  constructor(
    @InjectRepository(Book)
    private repository: Repository<Book>,
  ) {}

  async create(createBookDto: CreateBookDto) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const book = queryRunner.manager
        .getRepository(Book)
        .create(createBookDto);
      const savedBook = await queryRunner.manager
        .getRepository(Book)
        .save(book);
      await queryRunner.commitTransaction();
      this.logger.log(`Created book with id: ${savedBook.id}`);
      return savedBook;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create book: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: number) {
    return this.repository.findOneBy({ id });
  }

  findByIds(ids: number[]) {
    return this.repository.findBy({ id: In(ids) });
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.getRepository(Book).update(id, updateBookDto);
      const findBook = await queryRunner.manager
        .getRepository(Book)
        .findOneBy({ id });
      await queryRunner.commitTransaction();
      this.logger.log(`Updated book with id: ${id}`);
      return findBook;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to update book: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const findBook = await queryRunner.manager
        .getRepository(Book)
        .findOneBy({ id });

      if (!findBook) {
        this.logger.warn(`Book with id: ${id} not found`);
        return null;
      }
      await queryRunner.manager.getRepository(Book).remove(findBook);
      await queryRunner.commitTransaction();
      this.logger.log(`Removed book with id: ${id}`);
      return findBook;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to remove book: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
