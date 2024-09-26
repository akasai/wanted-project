import { Test, TestingModule } from '@nestjs/testing'
import { GetPostListHandler } from '../../../src/modules/post/handlers/get-post-list.handler'
import { PostService } from '../../../src/modules/post/post.service'
import { GetPostListQuery } from '../../../src/modules/post/queries'
import Mocker from '../../lib/mock'

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
    const postList = Mocker.postListDesc

    it('GetPostListQuery가 주어지면 게시글 목록이 정상적으로 조회된다.', async () => {
      // given
      service.getPostList = jest.fn().mockResolvedValue(postList)
      const query = new GetPostListQuery(1)

      // when
      const result = await handler.execute(query)

      // then
      expect(service.getPostList).toHaveBeenCalled()
      result.forEach((post, idx) => {
        expect(post).toEqual(
          expect.objectContaining({
            id: 10 - idx,
            title: '제목',
            content: '내용',
            author: '작성자',
          }),
        )
      })
    })
  })
})
