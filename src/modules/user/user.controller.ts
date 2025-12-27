import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignInDto, SignUpDto } from './dto/user.dto';
import { AccessTokenGuard } from '../../guards/accessToken.guard';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async signUp(@Body() payload: SignUpDto) {
    return await this.userService.signUp(payload);
  }

  @Post('login')
  async signIn(@Body() payload: SignInDto) {
    const findUser = await this.userService.findOneByEmail(payload.email);
    if (!findUser)
      throw new BadRequestException('Your account is not registered');

    return await this.userService.signIn(payload);
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  logout() {
    return this.userService.signOut();
  }
}
