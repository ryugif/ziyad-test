import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../../databases/book/book.entity';

@Module({
  controllers: [BookController],
  providers: [BookService],
  imports: [TypeOrmModule.forFeature([Book])],
  exports: [BookService],
})
export class BookModule {}
