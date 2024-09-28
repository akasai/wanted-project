import { Test, TestingModule } from '@nestjs/testing'
import { CommentService } from '../../../src/modules/comment/comment.service'
import { SimplePostModel } from '../../../src/modules/post/models'
import { PostService } from '../../../src/modules/post/post.service'
import { GetPostListHandler } from '../../../src/modules/post/queries/handlers'
import { GetPostListQuery } from '../../../src/modules/post/queries/impl'
import Mocker from '../../lib/mock'

describe('GetPostListHandler', () => {
  let handler: GetPostListHandler
  let service: PostService
  let commentService: CommentService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPostListHandler,
        {
          provide: PostService,
          useValue: {
            getPostList: jest.fn(),
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

    handler = module.get<GetPostListHandler>(GetPostListHandler)
    service = module.get<PostService>(PostService)
    commentService = module.get<CommentService>(CommentService)
  })

  describe('게시글 목록 조회', () => {
    it('GetPostListQuery가 주어지면 게시글 목록이 정상적으로 조회된다.', async () => {
      // given
      service.getPostList = jest.fn().mockResolvedValue(Mocker.postListDesc)
      commentService.getCommentCounts = jest.fn().mockResolvedValue(Mocker.commentCount)

      // when
      const result = await handler.execute(new GetPostListQuery(1))

      // then
      expect(service.getPostList).toHaveBeenCalledTimes(1)
      expect(commentService.getCommentCounts).toHaveBeenCalledTimes(1)
      result.forEach((post, idx) => {
        expect(post).toBeInstanceOf(SimplePostModel)
        expect(post).toEqual(
          expect.objectContaining({
            id: 10 - idx,
            title: '제목',
            content: '내용',
            author: '작성자',
            comment_count: expect.any(Number),
          }),
        )
      })
    })
  })
})
