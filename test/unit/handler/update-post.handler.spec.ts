import { Test, TestingModule } from '@nestjs/testing'
import { EditPostCommand } from '../../../src/modules/post/commands'
import { EditPostHandler } from '../../../src/modules/post/handlers/edit-post.handler'
import { PostService } from '../../../src/modules/post/post.service'
import Mocker from '../../lib/mock'

describe('EditPostHandler', () => {
  let handler: EditPostHandler
  let service: PostService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EditPostHandler,
        {
          provide: PostService,
          useValue: {
            updatePost: jest.fn(),
          },
        },
      ],
    }).compile()

    handler = module.get<EditPostHandler>(EditPostHandler)
    service = module.get<PostService>(PostService)
  })

  describe('게시글 수정', () => {
    const post = Mocker.updatedPost

    it('[title] EditPostCommand 가 주어지면 게시글이 정상적으로 생성된다.', async () => {
      // given
      service.updatePost = jest.fn().mockResolvedValue(post)
      const command = new EditPostCommand(1, '작성자', 'password', '변경 제목')

      // when
      const result = await handler.execute(command)

      // then
      expect(service.updatePost).toHaveBeenCalled()
      expect(result).toEqual({
        title: '제목 변경',
        updated_at: expect.any(Date),
      })
    })

    it('[content] EditPostCommand 가 주어지면 게시글이 정상적으로 생성된다.', async () => {
      // given
      service.updatePost = jest.fn().mockResolvedValue(post)
      const command = new EditPostCommand(1, '작성자', 'password', undefined, '변경 내용')

      // when
      const result = await handler.execute(command)

      // then
      expect(service.updatePost).toHaveBeenCalled()
      expect(result).toEqual({
        content: '내용 변경',
        updated_at: expect.any(Date),
      })
    })

    it('[All] EditPostCommand 가 주어지면 게시글이 정상적으로 생성된다.', async () => {
      // given
      service.updatePost = jest.fn().mockResolvedValue(post)
      const command = new EditPostCommand(1, '작성자', 'password', '변경 제목', '변경 내용')
      // when
      const result = await handler.execute(command)

      // then
      expect(service.updatePost).toHaveBeenCalled()
      expect(result).toEqual({
        title: '제목 변경',
        content: '내용 변경',
        updated_at: expect.any(Date),
      })
    })
  })
})
