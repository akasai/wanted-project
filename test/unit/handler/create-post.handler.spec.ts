import { EventBus } from '@nestjs/cqrs'
import { Test, TestingModule } from '@nestjs/testing'
import { CreatePostHandler } from '../../../src/modules/post/commands/handlers'
import { CreatePostCommand } from '../../../src/modules/post/commands/impl'
import { KeywordEvent } from '../../../src/modules/post/events/impl'
import { PostService } from '../../../src/modules/post/post.service'
import Mocker from '../../lib/mock'

describe('CreatePostHandler', () => {
  let handler: CreatePostHandler
  let service: PostService
  let eventBus: EventBus

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePostHandler,
        {
          provide: PostService,
          useValue: {
            createPost: jest.fn(),
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

    handler = module.get<CreatePostHandler>(CreatePostHandler)
    service = module.get<PostService>(PostService)
    eventBus = module.get<EventBus>(EventBus)
  })

  describe('게시글 작성', () => {
    const createdPost = Mocker.post

    it('CreatePostCommand가 주어지면 게시글이 정상적으로 생성된다.', async () => {
      // given
      service.createPost = jest.fn().mockResolvedValue(createdPost)
      eventBus.publish = jest.fn()
      const command = new CreatePostCommand('제목', '내용', '작성자', 'password')

      // when
      const result = await handler.execute(command)

      // then
      expect(service.createPost).toHaveBeenCalledTimes(1)
      expect(service.createPost).toHaveBeenNthCalledWith(1, '제목', '내용', '작성자', 'password')
      expect(eventBus.publish).toHaveBeenCalledTimes(1)
      expect(eventBus.publish).toHaveBeenNthCalledWith(1, new KeywordEvent('post', expect.any(Number), '내용'))
      expect(result).toBe(createdPost.id)
    })
  })
})
