import { Test, TestingModule } from '@nestjs/testing'
import { AlarmService } from '../../../src/common/alarm/alarm.service'
import { testSleep } from '../../lib/lib'

describe('AlarmService', () => {
  let service: AlarmService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlarmService],
    }).compile()

    service = module.get<AlarmService>(AlarmService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('알람 요청을 하면 알람이 전송된다.', async () => {
    // given
    console.log = jest.fn()

    // when
    service.sendAlarm(['user1', 'user2'], '알람 메시지')

    // then
    await testSleep(2100) // 2000ms 딜레이를 고려하여 약간 더 긴 시간 대기)
    expect(console.log).toHaveBeenCalledWith('[user1, user2]: 알람 메시지 - 2000ms delayed')
  })
})
