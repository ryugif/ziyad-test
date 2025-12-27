import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTokenStrategy } from '../../guards/accessToken.strategy';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../../databases/user/user.entity';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports
require('dotenv').config();

@Module({
  controllers: [UserController],
  providers: [UserService, AccessTokenStrategy],
  imports: [
    JwtModule.register({
      secret: (process.env.JWT_ACCESS_SECRET as unknown) as string,
      signOptions: {
        expiresIn: '2Hrs',
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  exports: [UserService],
})
export class UserModule {}
