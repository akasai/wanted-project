import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { Test, TestingModule } from '@nestjs/testing'
import { POST_STATUS } from '../../../src/common/enums'
import { DeletePostCommand } from '../../../src/modules/post/commands'
import { CreatePostCommand } from '../../../src/modules/post/commands/create-post.command'
import { EditPostCommand } from '../../../src/modules/post/commands/edit-post.command'
import { CreatePostDto, DeletePostDto, EditPostDto } from '../../../src/modules/post/dto'
import { SearchType } from '../../../src/modules/post/models/post'
import { PostController } from '../../../src/modules/post/post.controller'
import { GetPostListQuery } from '../../../src/modules/post/queries/get-post-list.query'
import { GetPostQuery } from '../../../src/modules/post/queries/get-post.query'

describe('PostController', () => {
  let controller: PostController
  let commandBus: CommandBus
  let queryBus: QueryBus

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(), // CommandBus의 execute 메서드 모킹
          },
        },
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(), // QueryBus의 execute 메서드 모킹
          },
        },
      ],
    }).compile()

    controller = module.get<PostController>(PostController)
    commandBus = module.get<CommandBus>(CommandBus)
    queryBus = module.get<QueryBus>(QueryBus)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('게시글', () => {
    it('게시글 작성 요청이 오면 commandBus.execute 실행된다.', async () => {
      const body: CreatePostDto = {
        title: '제목',
        content: '내용',
        author: '작성자',
        password: '1234',
      }

      commandBus.execute = jest.fn().mockResolvedValueOnce(1)

      const result = await controller.createPost(body)

      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreatePostCommand(body.title, body.content, body.author, body.password),
      )
      expect(result).toEqual({ id: 1 })
    })

    it('게시글 조회 요청이 오면 queryBus.execute 실행된다.', async () => {
      queryBus.execute = jest.fn().mockResolvedValueOnce({
        id: 1,
        title: '제목',
        content: '내용',
        author_name: '작성자',
        created_at: new Date(),
        updated_at: null,
      })

      const result = await controller.getPost(1)

      expect(queryBus.execute).toHaveBeenCalledWith(new GetPostQuery(1))
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          title: '제목',
          content: '내용',
          author_name: '작성자',
          updated_at: null,
        }),
      )
    })

    it('게시글 목록 조회 요청이 오면 queryBus.execute 실행된다.', async () => {
      const query = { page: 1 }
      queryBus.execute = jest.fn().mockResolvedValue([
        {
          id: 1,
          title: '제목',
          content: '내용',
          author_name: '작성자',
          created_at: new Date(),
          updated_at: null,
        },
      ])

      const result = await controller.getPostList(query)

      expect(queryBus.execute).toHaveBeenCalledWith(new GetPostListQuery(1))
      expect(result.length).toBe(1)
    })

    it('게시글 목록 검색 조회 요청이 오면 queryBus.execute 실행된다.', async () => {
      const query = {
        page: 1,
        search_type: 'title' as SearchType,
        keyword: '내용',
      }
      queryBus.execute = jest.fn().mockResolvedValue([
        {
          id: 1,
          title: '제목',
          content: '내용',
          author_name: '작성자',
          created_at: new Date(),
          updated_at: null,
        },
      ])

      const result = await controller.getPostList(query)

      expect(queryBus.execute).toHaveBeenCalledWith(new GetPostListQuery(1, 'title', '내용'))
      expect(result.length).toBe(1)
    })

    it('게시글 목록 오름차순 조회 요청이 오면 queryBus.execute 실행된다.', async () => {
      const query = { page: 1, order: 'asc' as 'asc' | 'desc' }
      queryBus.execute = jest.fn().mockResolvedValue([
        {
          id: 1,
          title: '제목',
          content: '내용',
          author_name: '작성자',
          created_at: new Date(),
          updated_at: null,
        },
      ])

      const result = await controller.getPostList(query)

      expect(queryBus.execute).toHaveBeenCalledWith(new GetPostListQuery(1, undefined, undefined, 'asc'))
      expect(result.length).toBe(1)
    })

    it('게시글 제목 수정 요청이 오면 commandBus.execute 실행된다.', async () => {
      const body: EditPostDto = {
        title: '변경 제목',
        author: '작성자',
        password: '1234',
      }
      commandBus.execute = jest.fn().mockResolvedValue({ title: '변경 제목', updated_at: new Date() })

      const result = await controller.editPost(1, body)

      expect(commandBus.execute).toHaveBeenCalledWith(new EditPostCommand(1, '작성자', '1234', '변경 제목'))
      expect(result).toEqual({
        title: '변경 제목',
        updated_at: expect.any(Date),
      })
    })

    it('게시글 내용 수정 요청이 오면 commandBus.execute 실행된다.', async () => {
      const body: EditPostDto = {
        content: '변경 내용',
        author: '작성자',
        password: '1234',
      }
      commandBus.execute = jest.fn().mockResolvedValue({ content: '변경 내용', updated_at: new Date() })

      const result = await controller.editPost(1, body)

      expect(commandBus.execute).toHaveBeenCalledWith(new EditPostCommand(1, '작성자', '1234', undefined, '변경 내용'))
      expect(result).toEqual({
        content: '변경 내용',
        updated_at: expect.any(Date),
      })
    })

    it('게시글 수정 요청이 오면 commandBus.execute 실행된다.', async () => {
      const body: EditPostDto = {
        title: '변경 제목',
        content: '변경 내용',
        author: '작성자',
        password: '1234',
      }
      commandBus.execute = jest.fn().mockResolvedValue({
        title: '변경 제목',
        content: '변경 내용',
        updated_at: new Date(),
      })

      const result = await controller.editPost(1, body)

      expect(commandBus.execute).toHaveBeenCalledWith(
        new EditPostCommand(1, '작성자', '1234', '변경 제목', '변경 내용'),
      )
      expect(result).toEqual({
        title: '변경 제목',
        content: '변경 내용',
        updated_at: expect.any(Date),
      })
    })

    it('게시글 삭제 요청이 오면 commandBus.execute 실행된다.', async () => {
      const body: DeletePostDto = {
        author: '작성자',
        password: '1234',
      }
      commandBus.execute = jest.fn().mockResolvedValue({
        id: 1,
        status: POST_STATUS.DELETED,
        updated_at: new Date(),
      })

      const result = await controller.deletePost(1, body)

      expect(commandBus.execute).toHaveBeenCalledWith(new DeletePostCommand(1, '작성자', '1234'))
      expect(result).toBeUndefined() // return void
    })
  })
})
