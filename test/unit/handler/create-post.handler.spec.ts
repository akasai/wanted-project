import { Test, TestingModule } from '@nestjs/testing'
import { CreatePostCommand } from '../../../src/modules/post/commands'
import { CreatePostHandler } from '../../../src/modules/post/handlers/create-post.handler'
import { PostService } from '../../../src/modules/post/post.service'
import Mocker from '../../lib/mock'

describe('CreatePostHandler', () => {
  let handler: CreatePostHandler
  let service: PostService

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
      ],
    }).compile()

    handler = module.get<CreatePostHandler>(CreatePostHandler)
    service = module.get<PostService>(PostService)
  })

  describe('게시글 작성', () => {
    const createdPost = Mocker.post

    it('CreatePostCommand가 주어지면 게시글이 정상적으로 생성된다.', async () => {
      // given
      service.createPost = jest.fn().mockResolvedValue(createdPost)
      const command = new CreatePostCommand('제목', '내용', '작성자', 'password')

      // when
      const result = await handler.execute(command)

      // then
      expect(service.createPost).toHaveBeenCalled()
      expect(result).toBe(createdPost.id)
    })
  })
})
