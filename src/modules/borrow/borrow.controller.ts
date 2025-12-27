/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../../guards/accessToken.guard';
import { UserService } from '../user/user.service';
import { BorrowService } from './borrow.service';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { ReturnBookDto } from './dto/return-book.dto';
import { ERROR_CODE, generateTraceId } from '../../utils/utils';
import { BookService } from '../book/book.service';

@Controller('borrow')
@UseGuards(AccessTokenGuard)
export class BorrowController {
  constructor(
    private readonly borrowService: BorrowService,
    private readonly userService: UserService,
    private readonly bookService: BookService,
  ) {}

  @Post()
  async borrowBook(@Body() payload: BorrowBookDto, @Req() req: any) {
    const authId = req.user.sub as unknown as number;
    const auth = await this.userService.findOneById(authId);

    // Check if user is registered
    if (!auth)
      throw new UnprocessableEntityException({
        message: ERROR_CODE.INVALID_USER.message,
        ziyad_error_code: ERROR_CODE.INVALID_USER.ziyadErrorCode,
        trace_id: generateTraceId(),
      });

    //   Merge duplicate book ids in the request payload
    const mergedBooks: { id: number; quantity: number }[] = [];
    for (const book of payload.books) {
      const existingBook = mergedBooks.find((b) => b.id === book.id);
      if (existingBook) {
        existingBook.quantity += book.quantity;
      } else {
        mergedBooks.push({ id: book.id, quantity: book.quantity });
      }
    }
    payload.books = mergedBooks;

    const findBooks = await this.bookService.findByIds(
      payload.books.map((book) => book.id),
    );

    // Check if all requested books exist
    if (findBooks.length !== payload.books.length)
      throw new UnprocessableEntityException({
        message: ERROR_CODE.BOOK_NOT_FOUND.message,
        ziyad_error_code: ERROR_CODE.BOOK_NOT_FOUND.ziyadErrorCode,
        trace_id: generateTraceId(),
      });

    //   check requested quantity with available stock
    for (const book of payload.books) {
      const foundBook = findBooks.find((b) => b.id === book.id);
      if (!foundBook || foundBook.stock < book.quantity)
        throw new UnprocessableEntityException({
          message: ERROR_CODE.QUANTITY_EXCEEDS_STOCK.message,
          ziyad_error_code: ERROR_CODE.QUANTITY_EXCEEDS_STOCK.ziyadErrorCode,
          trace_id: generateTraceId(),
        });
    }

    const borrowedBooks = await this.borrowService.borrowBook(payload, auth.id);
    return {
      message: `Successfully borrowed ${borrowedBooks.length} books.`,
      data: borrowedBooks,
    };
  }

  @Post('return')
  async returnBook(@Body() payload: ReturnBookDto, @Req() req: any) {
    const authId = req.user.sub as unknown as number;
    const auth = await this.userService.findOneById(authId);

    if (!auth)
      throw new UnprocessableEntityException({
        message: ERROR_CODE.INVALID_USER.message,
        ziyad_error_code: ERROR_CODE.INVALID_USER.ziyadErrorCode,
        trace_id: generateTraceId(),
      });

    //   Merge duplicate book ids in the request payload
    const mergedBooks: { id: number; quantity: number }[] = [];
    for (const book of payload.books) {
      const existingBook = mergedBooks.find((b) => b.id === book.id);
      if (existingBook) {
        existingBook.quantity += book.quantity;
      } else {
        mergedBooks.push({ id: book.id, quantity: book.quantity });
      }
    }
    payload.books = mergedBooks;

    const findBooks = await this.bookService.findByIds(
      payload.books.map((book) => book.id),
    );

    // check if all requested books exist
    if (findBooks.length !== payload.books.length)
      throw new UnprocessableEntityException({
        message: ERROR_CODE.BOOK_NOT_FOUND.message,
        ziyad_error_code: ERROR_CODE.BOOK_NOT_FOUND.ziyadErrorCode,
        trace_id: generateTraceId(),
      });

    //   Check returned quantity does not exceed borrowed quantity
    const borrowedTransactions =
      await this.borrowService.getBorrowedTransactions(
        auth.id,
        payload.books.map((book) => book.id),
      );

    //   if there's no borrowed transaction found
    if (borrowedTransactions.length === 0)
      throw new UnprocessableEntityException({
        message: ERROR_CODE.TRANSACTION_NOT_FOUND.message,
        ziyad_error_code: ERROR_CODE.TRANSACTION_NOT_FOUND.ziyadErrorCode,
        trace_id: generateTraceId(),
      });

    //   if there's other books that not borrowed but trying to return, throw error
    for (const book of payload.books) {
      const transaction = borrowedTransactions.find(
        (tx) => tx.book.id === book.id,
      );
      if (!transaction)
        throw new UnprocessableEntityException({
          message: ERROR_CODE.TRANSACTION_NOT_FOUND.message,
          ziyad_error_code: ERROR_CODE.TRANSACTION_NOT_FOUND.ziyadErrorCode,
          trace_id: generateTraceId(),
        });

      if (book.quantity > transaction.quantity)
        throw new UnprocessableEntityException({
          message: ERROR_CODE.QUANTITY_NOT_MATCH.message,
          ziyad_error_code: ERROR_CODE.QUANTITY_NOT_MATCH.ziyadErrorCode,
          trace_id: generateTraceId(),
        });
    }

    const returnedBooks = await this.borrowService.returnBook(payload, auth.id);
    return {
      message: `Successfully returned ${returnedBooks.length} books.`,
      data: returnedBooks,
    };
  }

  @Get()
  async getUserTransactions(@Req() req: any) {
    const authId = req.user.sub as unknown as number;
    const auth = await this.userService.findOneById(authId);

    if (!auth)
      throw new UnprocessableEntityException({
        message: ERROR_CODE.INVALID_USER.message,
        ziyad_error_code: ERROR_CODE.INVALID_USER.ziyadErrorCode,
        trace_id: generateTraceId(),
      });

    return await this.borrowService.getAllTransactionsByUser(auth.id);
  }
}
