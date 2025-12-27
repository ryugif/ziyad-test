/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Type } from 'class-transformer';
import {
  IsArray,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class BookDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class BorrowBookDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookDto)
  books: BookDto[];

  @IsNotEmpty()
  @IsISO8601({ strict: true }) // Ensures a valid ISO 8601 date string
  @MaxLength(10) // Enforces the 'YYYY-MM-DD' length (10 characters)
  borrowed_date: Date;

  @IsNotEmpty()
  @IsNumber()
  due_days: number;
}
