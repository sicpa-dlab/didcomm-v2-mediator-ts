import { LoggerModule } from '@logger'
import { Module } from '@nestjs/common'
import { VersionController } from './version.controller'

@Module({
  imports: [LoggerModule.forFeature([VersionController])],
  controllers: [VersionController],
})
export class VersionModule {}
