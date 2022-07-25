import { LoggerModule } from '@logger'
import { Module } from '@nestjs/common'
import { DidcommService } from './didcomm.service'
import { DidcommDidResolverService, DidResolverService, SecretsResolverService } from './resolvers'

@Module({
  imports: [
    LoggerModule.forFeature([DidcommService, DidResolverService, DidcommDidResolverService, SecretsResolverService]),
  ],
  providers: [DidcommService, DidResolverService, DidcommDidResolverService, SecretsResolverService],
  exports: [DidcommService],
})
export class DidcommModule {}
