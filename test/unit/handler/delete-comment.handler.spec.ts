import { Test, TestingModule } from '@nestjs/testing'
import { COMMENT_STATUS } from '../../../src/common/enums'
import { DeleteCommentCommand } from '../../../src/modules/comment/commands'
import { CommentService } from '../../../src/modules/comment/comment.service'
import { DeleteCommentHandler } from '../../../src/modules/comment/handlers/delete-comment.handler'
import Mocker from '../../lib/mock'

describe('DeleteCommentHandler', () => {
  let handler: DeleteCommentHandler
  let service: CommentService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCommentHandler,
        {
          provide: CommentService,
          useValue: {
            softDeleteComment: jest.fn(),
          },
        },
      ],
    }).compile()

    handler = module.get<DeleteCommentHandler>(DeleteCommentHandler)
    service = module.get<CommentService>(CommentService)
  })

  describe('댓글 삭제', () => {
    const comment = Mocker.deletedComment

    it('DeleteCommentCommand가 주어지면 게시글이 정상적으로 삭제된다.', async () => {
      // given
      service.softDeleteComment = jest.fn().mockResolvedValue(comment)
      const command = new DeleteCommentCommand(1, 1, '작성자', 'password')

      // when
      const result = await handler.execute(command)

      // then
      expect(service.softDeleteComment).toHaveBeenCalled()
      expect(result).toEqual({ id: 1, status: COMMENT_STATUS.DELETED, updated_at: expect.any(Date) })
    })
  })
})
