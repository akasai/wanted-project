import { Test, TestingModule } from '@nestjs/testing'
import { POST_STATUS } from '../../../src/common/enums'
import { DeletePostCommand } from '../../../src/modules/post/commands/impl'
import { DeletePostHandler } from '../../../src/modules/post/commands/handlers'
import { PostService } from '../../../src/modules/post/post.service'
import Mocker from '../../lib/mock'

describe('DeletePostHandler', () => {
  let handler: DeletePostHandler
  let service: PostService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePostHandler,
        {
          provide: PostService,
          useValue: {
            updatePost: jest.fn(),
          },
        },
      ],
    }).compile()

    handler = module.get<DeletePostHandler>(DeletePostHandler)
    service = module.get<PostService>(PostService)
  })

  describe('게시글 삭제', () => {
    const post = Mocker.deletedPost

    it('DeletePostCommand가 주어지면 게시글이 정상적으로 삭제된다.', async () => {
      // given
      service.softDeletePost = jest.fn().mockResolvedValue(post)
      const command = new DeletePostCommand(1, '작성자', 'password')

      // when
      const result = await handler.execute(command)

      // then
      expect(service.softDeletePost).toHaveBeenCalled()
      expect(result).toEqual({ id: 1, status: POST_STATUS.DELETED, updated_at: expect.any(Date) })
    })
  })
})
