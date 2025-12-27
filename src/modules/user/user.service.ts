import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import dayjs from 'dayjs';

// import { FilterOperator, PaginateQuery, paginate } from 'nestjs-paginate';
import { User } from 'src/databases/user/user.entity';
import { Repository } from 'typeorm';
import { SignInDto, SignUpDto } from './dto/user.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports
require('dotenv').config();

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async findOneByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  async findOneById(id: number) {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async createUser(registerData: SignUpDto) {
    try {
      // Check if user exists
      const userExists = await this.findOneByEmail(registerData.email);
      if (userExists)
        return {
          status: HttpStatus.CONFLICT,
          message: 'User already exists',
          data: null,
        };

      // Hash password
      const hash = await this.hashData(registerData.password);
      const user = await this.userRepository.save({
        ...registerData,
        password: hash,
      });

      const tokens = await this.getTokens(user.id, registerData.email);
      const findUser = await this.findOneById(user.id);
      return {
        ...tokens,
        user: findUser,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      );
    }
  }

  async signUp(
    data: SignUpDto,
  ): Promise<{
    token: string;
    expires_at: Date;
    user: User;
  }> {
    try {
      // Check if user exists
      const userExists = await this.findOneByEmail(data.email);
      if (userExists) throw new BadRequestException('User already exists');

      // Hash password
      const hash = await this.hashData(data.password);
      const user = await this.userRepository.save({
        ...data,
        password: hash,
      });

      const tokens = await this.getTokens(user.id, data.email);
      const findUser = await this.findOneById(user.id);

      return {
        ...tokens,
        user: findUser!,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      );
    }
  }

  async signIn(data: SignInDto) {
    // Check if user exists
    const user = await this.findOneByEmail(data.email);
    if (!user) throw new BadRequestException('Your email is not registered');

    const passwordMatches = await argon2.verify(user.password, data.password);
    if (!passwordMatches) throw new BadRequestException('Invalid credentials');

    const token = await this.generateAccessToken(user.id, user.email);
    const tokens = {
      token: token.token,
      expires_at: token.expire_at,
    };

    return {
      token: tokens.token,
      expires_at: tokens.expires_at,
      user: user,
    };
  }

  async hashData(data: string) {
    return await argon2.hash(data);
  }

  signOut() {
    return {
      message: 'Logout successful',
    };
  }

  async generateAccessToken(userId: number, email: string) {
    const expire_at = dayjs()
      .add(
        (process.env.JWT_ACCESS_EXPIRATION_IN_SECOND as unknown) as number,
        'seconds',
      )
      .toDate();

    const token = await this.jwtService.signAsync(
      {
        sub: userId,
        email,
        expireIn:
          ((process.env.JWT_ACCESS_EXPIRATION_IN_SECOND as unknown) as number) +
          's',
      },
      {
        secret: (process.env.JWT_ACCESS_SECRET as unknown) as string,
      },
    );

    return {
      token,
      expire_at,
    };
  }

  async getTokens(userId: number, email: string) {
    const token = await this.generateAccessToken(userId, email);
    return {
      token: token.token,
      expires_at: token.expire_at,
    };
  }
}
