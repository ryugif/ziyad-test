import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1766802803165 implements MigrationInterface {
  name = 'Migration1766802803165';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "book" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "title" character varying NOT NULL, "author" character varying, "published_date" date, "stock" integer NOT NULL, CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "book_transaction" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "borrowed_date" date NOT NULL, "returned_date" date, "due_date" date, "quantity" integer NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'borrowed', "bookId" integer, "userId" integer, CONSTRAINT "PK_0b0b300d239d2ffb12c353a452a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(255) NOT NULL, "email" character varying(300) NOT NULL, "password" character varying(300) NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_transaction" ADD CONSTRAINT "FK_41ee86965664ef2806d81a8b31a" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_transaction" ADD CONSTRAINT "FK_ea4e4943cb42ffb698ac3c87853" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "book_transaction" DROP CONSTRAINT "FK_ea4e4943cb42ffb698ac3c87853"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_transaction" DROP CONSTRAINT "FK_41ee86965664ef2806d81a8b31a"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "book_transaction"`);
    await queryRunner.query(`DROP TABLE "book"`);
  }
}
