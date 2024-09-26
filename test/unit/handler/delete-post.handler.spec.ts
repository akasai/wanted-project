import { Test, TestingModule } from '@nestjs/testing'
import { POST_STATUS } from '../../../src/common/enums'
import { DeletePostCommand } from '../../../src/modules/post/commands'
import { DeletePostHandler } from '../../../src/modules/post/handlers/delete-post.handler'
import { PostService } from '../../../src/modules/post/post.service'

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
    const post = {
      id: 1,
      title: '제목',
      content: '내용',
      author_name: '작성자',
      password_hash: '비밀번호',
      status: POST_STATUS.DELETED,
      created_at: new Date(),
      updated_at: new Date(),
    }

    it('DeletePostCommand가 주어지면 게시글이 정상적으로 삭제된다.', async () => {
      // given
      service.softDeletePost = jest.fn().mockResolvedValue(post)
      const command = new DeletePostCommand(1, '작성자', 'password')

      // when
      const result = await handler.execute(command)

      // then
      expect(service.softDeletePost).toHaveBeenCalled()
      expect(result).toEqual({
        id: 1,
        status: POST_STATUS.DELETED,
        updated_at: expect.any(Date),
      })
    })
  })
})
