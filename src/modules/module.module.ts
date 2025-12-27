import { Global, Module } from '@nestjs/common';
import { UserModule } from './user/user.module';

@Global()
@Module({
  imports: [UserModule],
})
export class ModulesModule {}
