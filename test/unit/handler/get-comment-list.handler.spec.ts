import { Test, TestingModule } from '@nestjs/testing'
import { CommentService } from '../../../src/modules/comment/comment.service'
import { CommentModel } from '../../../src/modules/comment/models'
import { GetCommentListHandler } from '../../../src/modules/comment/queries/handlers'
import { GetCommentListQuery } from '../../../src/modules/comment/queries/impl'
import Mocker from '../../lib/mock'

describe('GetCommentListHandler', () => {
  let handler: GetCommentListHandler
  let service: CommentService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCommentListHandler,
        {
          provide: CommentService,
          useValue: {
            getCommentCounts: jest.fn(),
          },
        },
      ],
    }).compile()

    handler = module.get<GetCommentListHandler>(GetCommentListHandler)
    service = module.get<CommentService>(CommentService)
  })

  describe('댓글 목록 조회', () => {
    it('GetCommentListQuery가 주어지면 댓글 목록이 정상적으로 조회된다.', async () => {
      // given
      service.getNestedCommentList = jest.fn().mockResolvedValue(Mocker.nestedCommentList)

      // when
      const result = await handler.execute(new GetCommentListQuery(1, 1, 'desc'))

      // then
      expect(service.getNestedCommentList).toHaveBeenCalledTimes(1)
      expect(service.getNestedCommentList).toHaveBeenNthCalledWith(1, 1, 'desc', 1)
      result.forEach((comment) => {
        expect(comment).toBeInstanceOf(CommentModel)
        expect(comment.reply).toBeDefined()
        expect(comment.reply.length).toBeGreaterThanOrEqual(0)
        comment.reply.forEach((c) => {
          expect(c).toBeInstanceOf(CommentModel)
          expect(c.reply).not.toBeDefined()
        })
      })
    })
  })
})
