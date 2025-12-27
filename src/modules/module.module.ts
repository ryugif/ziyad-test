import { Global, Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { BookModule } from './book/book.module';
import { BorrowModule } from './borrow/borrow.module';

@Global()
@Module({
  imports: [UserModule, BookModule, BorrowModule],
})
export class ModulesModule {}
