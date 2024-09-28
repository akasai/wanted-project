import { Test, TestingModule } from '@nestjs/testing'
import { AlarmService } from '../../../src/common/alarm/alarm.service'
import { KeywordService } from '../../../src/modules/keyword/keyword.service'
import { testSleep } from '../../lib/lib'

describe('KeywordService', () => {
  let service: KeywordService
  // let alarmService: AlarmService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeywordService,
        AlarmService,
        {
          provide: 'KEYWORD_CACHE',
          useValue: new Map<string, string[]>([
            ['게시글', ['작성자1', '작성자2']],
            ['댓글', ['작성자1']],
          ]),
        },
      ],
    }).compile()

    service = module.get<KeywordService>(KeywordService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('알람 전송', () => {
    it('1. 게시글에 키워드가 포함되면 알림이 전송된다.', async () => {
      // given
      console.log = jest.fn()

      // when
      service.checkKeywordIncluded('게시글 입니다.', 1, '키워드가 포함된 게시물이 등록되었습니다.')

      // then
      await testSleep(2100) // 2000ms 딜레이를 고려하여 약간 더 긴 시간 대기)
      expect(console.log).toHaveBeenCalledTimes(1)
      expect(console.log).toHaveBeenCalledWith('[작성자1, 작성자2]: 키워드가 포함된 게시물이 등록되었습니다. - 2000ms delayed')
    })

    it('2. 키워드가 포함되지 않은 경우 알림이 전송되지 않는다.', async () => {
      // given
      console.log = jest.fn()

      // when
      service.checkKeywordIncluded('내용없음', 1, '키워드가 포함된 게시물이 등록되었습니다.')

      // then
      expect(console.log).toHaveBeenCalledTimes(0)
    })

    it('3. 댓글에 키워드가 포함된 경우', async () => {
      // given
      console.log = jest.fn()

      // when
      service.checkKeywordIncluded('게시글 입니다.', 1, '키워드가 포함된 댓글이 등록되었습니다.')

      // then
      await testSleep(2100) // 2000ms 딜레이를 고려하여 약간 더 긴 시간 대기)
      expect(console.log).toHaveBeenCalledTimes(1)
      expect(console.log).toHaveBeenCalledWith('[작성자1, 작성자2]: 키워드가 포함된 댓글이 등록되었습니다. - 2000ms delayed')
    })

    it('4. 댓글에 키워드가 포함되지 않은 경우', async () => {
      // given
      console.log = jest.fn()

      // when
      service.checkKeywordIncluded('내용없음', 1, '키워드가 포함된 댓글이 등록되었습니다.')

      // then
      expect(console.log).toHaveBeenCalledTimes(0)
    })

    it('5. 여러 키워드가 있을 경우', async () => {
      // given
      console.log = jest.fn()

      // when
      service.checkKeywordIncluded('게시글 댓글.', 1, '키워드가 포함된 게시물이 등록되었습니다.')

      // then : 중복된 글자가 두개지만 실제로 알람은 2명에게만.
      await testSleep(2100) // 2000ms 딜레이를 고려하여 약간 더 긴 시간 대기)
      expect(console.log).toHaveBeenCalledTimes(1)
      expect(console.log).toHaveBeenCalledWith('[작성자1, 작성자2]: 키워드가 포함된 게시물이 등록되었습니다. - 2000ms delayed')
    })
  })
})
