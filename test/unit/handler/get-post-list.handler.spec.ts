import { Test, TestingModule } from '@nestjs/testing'
import { POST_STATUS } from '../../../src/common/enums'
import { GetPostListHandler } from '../../../src/modules/post/handlers/get-post-list.handler'
import { PostService } from '../../../src/modules/post/post.service'
import { GetPostListQuery } from '../../../src/modules/post/queries/get-post-list.query'

describe('GetPostListHandler', () => {
  let handler: GetPostListHandler
  let service: PostService

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
      ],
    }).compile()

    handler = module.get<GetPostListHandler>(GetPostListHandler)
    service = module.get<PostService>(PostService)
  })

  describe('게시글 목록 조회', () => {
    const postList = Array(10).fill({
      id: 1,
      title: '제목',
      content: '내용',
      author_name: '작성자',
      password_hash: '비밀번호',
      status: POST_STATUS.ACTIVE,
      created_at: new Date(),
      updated_at: null,
    })

    it('GetPostListQuery가 주어지면 게시글 목록이 정상적으로 조회된다.', async () => {
      // given
      service.getPostList = jest.fn().mockResolvedValue(postList)
      const query = new GetPostListQuery(1)

      // when
      const result = await handler.execute(query)

      // then
      expect(service.getPostList).toHaveBeenCalled()
      result.forEach((post) => {
        expect(post).toEqual(
          expect.objectContaining({
            id: 1,
            title: '제목',
            content: '내용',
            author: '작성자',
          }),
        )
      })
    })
  })
})
