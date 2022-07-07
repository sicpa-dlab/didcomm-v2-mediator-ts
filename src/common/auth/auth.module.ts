import { LoggerModule } from '@common/logger'
import { Global, Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Global()
@Module({
  imports: [LoggerModule.forFeature([AuthService, AuthController])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
