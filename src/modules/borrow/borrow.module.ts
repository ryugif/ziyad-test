import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../../databases/book/book.entity';
import { BorrowService } from './borrow.service';
import { BorrowController } from './borrow.controller';
import { UserModule } from '../user/user.module';
import { BookModule } from '../book/book.module';

@Module({
  controllers: [BorrowController],
  providers: [BorrowService],
  imports: [TypeOrmModule.forFeature([Book]), UserModule, BookModule],
})
export class BorrowModule {}
