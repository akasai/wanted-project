import { Global, Module } from '@nestjs/common'
import { AlarmService } from './alarm.service'

@Global()
@Module({
  providers: [AlarmService],
  exports: [AlarmService],
})
export class AlarmModule {
}
