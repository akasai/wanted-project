import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { CommentService } from '../../../src/modules/comment/comment.service'
import { GetPostHandler } from '../../../src/modules/post/handlers/get-post.handler'
import { PostService } from '../../../src/modules/post/post.service'
import { GetPostQuery } from '../../../src/modules/post/queries'
import Mocker from '../../lib/mock'

describe('GetPostHandler', () => {
  let handler: GetPostHandler
  let service: PostService
  let commentService: CommentService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPostHandler,
        {
          provide: PostService,
          useValue: {
            getPostById: jest.fn(),
          },
        },
        {
          provide: CommentService,
          useValue: {
            getCommentCounts: jest.fn(),
          },
        },
      ],
    }).compile()

    handler = module.get<GetPostHandler>(GetPostHandler)
    service = module.get<PostService>(PostService)
    commentService = module.get<CommentService>(CommentService)
  })

  describe('게시글 조회', () => {
    const post = Mocker.post

    it('GetPostQuery가 주어지면 게시글이 정상적으로 조회된다.', async () => {
      // given
      service.getPostById = jest.fn().mockResolvedValue(post)
      commentService.getCommentCounts = jest.fn().mockResolvedValue(Mocker.commentCount)
      const query = new GetPostQuery(1)

      // when
      const result = await handler.execute(query)

      // then
      expect(service.getPostById).toHaveBeenCalled()
      expect(commentService.getCommentCounts).toHaveBeenCalled()
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          title: '제목',
          content: '내용',
          author: '작성자',
          comment_count: 4,
        }),
      )
    })

    it('존재하지 않는 게시물은 에러를 반환한다.', async () => {
      // given
      service.getPostById = jest.fn().mockRejectedValue(new NotFoundException())
      const query = new GetPostQuery(99999)

      // when
      const result = handler.execute(query)

      // then
      await expect(result).rejects.toThrow(NotFoundException)
    })
  })
})
