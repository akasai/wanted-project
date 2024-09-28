import { Test, TestingModule } from '@nestjs/testing'
import { KeywordService } from '../../../src/modules/keyword/keyword.service'
import { KeywordEvent } from '../../../src/modules/post/events/keyword.event'
import { KeywordEventHandler } from '../../../src/modules/post/handlers/keyword-event.handler'

describe('KeywordEventHandler', () => {
  let handler: KeywordEventHandler
  let service: KeywordService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeywordEventHandler,
        {
          provide: KeywordService,
          useValue: {
            checkKeywordIncluded: jest.fn(),
          },
        },
      ],
    }).compile()

    handler = module.get<KeywordEventHandler>(KeywordEventHandler)
    service = module.get<KeywordService>(KeywordService)
  })

  describe('키워드 알람 조회', () => {
    it('[게시글] KeywordEvent가 발행되면 알람이 정상적으로 발행된다.', async () => {
      // given
      service.checkKeywordIncluded = jest.fn()

      // when
      handler.handle(new KeywordEvent('post', 1, '게시글 본문'))

      // then
      expect(service.checkKeywordIncluded).toHaveBeenCalledTimes(1)
      expect(service.checkKeywordIncluded).toHaveBeenNthCalledWith(1, '게시글 본문', 1, '키워드가 포함된 게시물이 등록되었습니다.')
    })

    it('[댓글] KeywordEvent가 발행되면 알람이 정상적으로 발행된다.', async () => {
      // given
      service.checkKeywordIncluded = jest.fn()

      // when
      handler.handle(new KeywordEvent('comment', 1, '댓글 본문'))

      // then
      expect(service.checkKeywordIncluded).toHaveBeenCalledTimes(1)
      expect(service.checkKeywordIncluded).toHaveBeenNthCalledWith(1, '댓글 본문', 1, '키워드가 포함된 댓글이 등록되었습니다.')
    })

  })
})
