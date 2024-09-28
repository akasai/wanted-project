import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { CommentService } from '../../../src/modules/comment/comment.service'
import CommentModel from '../../../src/modules/comment/models/comment-model'
import PostModel from '../../../src/modules/post/models/post-model'
import { PostService } from '../../../src/modules/post/post.service'
import { GetPostHandler } from '../../../src/modules/post/queries/handlers'
import { GetPostQuery } from '../../../src/modules/post/queries/impl'
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
            getNestedCommentList: jest.fn(),
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
    const comments = Mocker.nestedCommentList

    it('GetPostQuery가 주어지면 게시글이 정상적으로 조회된다.', async () => {
      // given
      service.getPostById = jest.fn().mockResolvedValue(post)
      commentService.getCommentCounts = jest.fn().mockResolvedValue(Mocker.commentCount)
      commentService.getNestedCommentList = jest.fn().mockResolvedValue(comments)
      const query = new GetPostQuery(1)

      // when
      const result = await handler.execute(query)

      // then
      expect(service.getPostById).toHaveBeenCalledTimes(1)
      expect(commentService.getCommentCounts).toHaveBeenCalledTimes(1)
      expect(commentService.getNestedCommentList).toHaveBeenCalledTimes(1)
      expect(result).toBeInstanceOf(PostModel)
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          title: '제목',
          content: '내용',
          author: '작성자',
          comment_count: 4,
          comment_list: expect.any(Array),
        }),
      )
      result.comment_list.forEach((comment) => {
        expect(comment).toBeInstanceOf(CommentModel)
        expect(comment.reply).toBeDefined()
        comment.reply.forEach((r) => {
          expect(r).toBeInstanceOf(CommentModel)
          expect(r.reply).not.toBeDefined()
        })
      })
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
