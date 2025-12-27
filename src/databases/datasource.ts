import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { User } from './user/user.entity';
import { Book } from './book/book.entity';
import { BookTransaction } from './book/book-transaction.entity';

config(); // Load .env file

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres', // or 'mysql', 'sqlite', etc.
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT!),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [User, Book, BookTransaction],
  migrations: ['migrations/*.ts'],
  synchronize: false, // Must be false for migrations
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
