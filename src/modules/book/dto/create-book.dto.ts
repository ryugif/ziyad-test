import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  author?: string | null;

  @IsDate()
  @IsOptional()
  publishedDate?: Date | null;

  @IsNumber()
  @IsNotEmpty()
  stock: number;
}
