import { EventBus } from '@nestjs/cqrs'
import { Test, TestingModule } from '@nestjs/testing'
import { CreateCommentHandler } from '../../../src/modules/comment/commands/handlers'
import { CreateCommentCommand } from '../../../src/modules/comment/commands/impl'
import { CommentService } from '../../../src/modules/comment/comment.service'
import { KeywordEvent } from '../../../src/modules/post/events/impl'
import Mocker from '../../lib/mock'

describe('CreateCommentHandler', () => {
  let handler: CreateCommentHandler
  let service: CommentService
  let eventBus: EventBus

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
        {
          provide: EventBus,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile()

    handler = module.get<CreateCommentHandler>(CreateCommentHandler)
    service = module.get<CommentService>(CommentService)
    eventBus = module.get<EventBus>(EventBus)
  })

  describe('댓글 작성', () => {
    const comment = Mocker.comment

    it('[댓글] CreateCommentCommand 가 주어지면 게시글이 정상적으로 생성된다.', async () => {
      // given
      service.createComment = jest.fn().mockResolvedValue(comment)
      eventBus.publish = jest.fn()
      const command = new CreateCommentCommand(1, '내용', '작성자', 'password')

      // when
      const result = await handler.execute(command)

      // then
      expect(service.createComment).toHaveBeenCalledTimes(1)
      expect(service.createComment).toHaveBeenNthCalledWith(1, 1, '내용', '작성자', 'password', undefined)
      expect(eventBus.publish).toHaveBeenCalledTimes(1)
      expect(eventBus.publish).toHaveBeenNthCalledWith(1, new KeywordEvent('comment', 1, '내용'))
      expect(result).toBe(comment.id)
    })

    it('[대댓글] CreateCommentCommand 가 주어지면 게시글이 정상적으로 생성된다.', async () => {
      // given
      service.createComment = jest.fn().mockResolvedValue(comment)
      eventBus.publish = jest.fn()
      const command = new CreateCommentCommand(1, '내용', '작성자', 'password', 1)

      // when
      const result = await handler.execute(command)

      // then
      expect(service.createComment).toHaveBeenCalledTimes(1)
      expect(service.createComment).toHaveBeenNthCalledWith(1, 1, '내용', '작성자', 'password', 1)
      expect(eventBus.publish).toHaveBeenCalledTimes(1)
      expect(eventBus.publish).toHaveBeenNthCalledWith(1, new KeywordEvent('comment', 1, '내용'))
      expect(result).toBe(comment.id)
    })
  })
})
