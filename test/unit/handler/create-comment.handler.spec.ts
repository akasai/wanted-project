import { Test, TestingModule } from '@nestjs/testing'
import { COMMENT_STATUS } from '../../../src/common/enums'
import { CreateCommentCommand } from '../../../src/modules/comment/commands'
import { CommentService } from '../../../src/modules/comment/comment.service'
import { CreateCommentHandler } from '../../../src/modules/comment/handlers/create-comment.handler'

describe('CreateCommentHandler', () => {
  let handler: CreateCommentHandler
  let service: CommentService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCommentHandler,
        {
          provide: CommentService,
          useValue: {
            createComment: jest.fn(),
          },
        },
      ],
    }).compile()

    handler = module.get<CreateCommentHandler>(CreateCommentHandler)
    service = module.get<CommentService>(CommentService)
  })

  describe('댓글 작성', () => {
    const comment = {
      id: 1,
      post_id: 1,
      parent_id: 1,
      content: '내용',
      author_name: '작성자',
      password_hash: 'password',
      status: COMMENT_STATUS.ACTIVE,
      created_at: new Date(),
      updated_at: null,
    }

    it('[댓글] CreateCommentCommand 가 주어지면 게시글이 정상적으로 생성된다.', async () => {
      // given
      service.createComment = jest.fn().mockResolvedValue(comment)
      const command = new CreateCommentCommand(1, '내용', '작성자', 'password')

      // when
      const result = await handler.execute(command)

      // then
      expect(service.createComment).toHaveBeenCalled()
      expect(result).toBe(comment.id)
    })

    it('[대댓글] CreateCommentCommand 가 주어지면 게시글이 정상적으로 생성된다.', async () => {
      // given
      service.createComment = jest.fn().mockResolvedValue(comment)
      const command = new CreateCommentCommand(1, '내용', '작성자', 'password', 1)

      // when
      const result = await handler.execute(command)

      // then
      expect(service.createComment).toHaveBeenCalled()
      expect(result).toBe(comment.id)
    })
  })
})
