import { INestApplication, ValidationPipe } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'
import { POST_STATUS } from '../../src/common/enums'
import { CreateCommentCommand, DeleteCommentCommand } from '../../src/modules/comment/commands/impl'
import { GetCommentListQuery } from '../../src/modules/comment/queries/impl'
import { CreatePostCommand, DeletePostCommand, EditPostCommand } from '../../src/modules/post/commands/impl'
import { GetPostCommentListDto, GetPostListDto } from '../../src/modules/post/models'
import { GetPostListQuery, GetPostQuery } from '../../src/modules/post/queries/impl'

describe('AppController (e2e)', () => {
  let app: INestApplication
  let commandBus: CommandBus
  let queryBus: QueryBus

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CommandBus)
      .useValue({
        register: jest.fn(), // CommandBus load를 위해 모킹
        execute: jest.fn(), // CommandBus의 execute 메서드를 모킹
      })
      .overrideProvider(QueryBus)
      .useValue({
        register: jest.fn(), // CommandBus load를 위해 모킹
        execute: jest.fn(), // CommandBus의 execute 메서드를 모킹
      })
      .compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    await app.init()
    commandBus = moduleFixture.get<CommandBus>(CommandBus)
    queryBus = moduleFixture.get<QueryBus>(QueryBus)
  })

  afterAll(async () => {
    await app.close()
  })

  it('/health (GET)', () => {
    return request(app.getHttpServer()).get('/health').expect(200).expect('OK')
  })

  describe('PostController', () => {
    it('게시물 작성', async () => {
      // CommandBus의 execute 메서드 모킹
      commandBus.execute = jest.fn().mockResolvedValue(1)

      const response = await request(app.getHttpServer())
        .post('/posts')
        .send({
          title: '제목',
          content: '내용',
          author: '작성자',
          password: '1234',
        })
        .expect(201)

      expect(commandBus.execute).toHaveBeenCalledWith(new CreatePostCommand('제목', '내용', '작성자', '1234'))
      expect(response.body).toEqual({ id: 1 })
    })

    it('게시물 조회', async () => {
      // QueryBus의 execute 메서드 모킹
      queryBus.execute = jest.fn().mockResolvedValueOnce({
        id: 1,
        title: '제목',
        content: '내용',
        author_name: '작성자',
        created_at: new Date(),
        updated_at: null,
      })

      const response = await request(app.getHttpServer()).get('/posts/1').expect(200)

      expect(queryBus.execute).toHaveBeenCalledWith(new GetPostQuery(1))
      expect(response.body).toEqual(
        expect.objectContaining({
          title: '제목',
          content: '내용',
          author_name: '작성자',
          updated_at: null,
        }),
      )
    })

    it('게시물 목록 조회', async () => {
      const query: GetPostListDto = { page: 1 }

      // QueryBus의 execute 메서드 모킹
      queryBus.execute = jest.fn().mockResolvedValueOnce([
        {
          id: '1',
          title: '제목',
          content: '내용',
          author_name: '작성자',
          created_at: new Date(),
          updated_at: null,
        },
      ])

      const response = await request(app.getHttpServer()).get('/posts').query(query).expect(200)

      expect(queryBus.execute).toHaveBeenCalledWith(new GetPostListQuery(1))
      expect(response.body.length).toBe(1)
    })

    it('게시물 목록 조회; 제목 검색', async () => {
      const query: GetPostListDto = {
        page: 1,
        search_type: 'title',
        keyword: '내용',
      }

      // QueryBus의 execute 메서드 모킹
      queryBus.execute = jest.fn().mockResolvedValueOnce([
        {
          id: 1,
          title: '제목',
          content: '내용',
          author_name: '작성자',
          created_at: new Date(),
          updated_at: null,
        },
      ])

      const response = await request(app.getHttpServer()).get('/posts').query(query).expect(200)

      expect(queryBus.execute).toHaveBeenCalledWith(new GetPostListQuery(1, 'title', '내용'))
      expect(response.body.length).toBe(1)
    })

    it('게시물 목록 조회; 작성자 검색', async () => {
      const query: GetPostListDto = {
        page: 1,
        search_type: 'author',
        keyword: '작성자',
      }

      // QueryBus의 execute 메서드 모킹
      queryBus.execute = jest.fn().mockResolvedValueOnce([
        {
          id: 1,
          title: '제목',
          content: '내용',
          author_name: '작성자',
          created_at: new Date(),
          updated_at: null,
        },
      ])

      const response = await request(app.getHttpServer()).get('/posts').query(query).expect(200)

      expect(queryBus.execute).toHaveBeenCalledWith(new GetPostListQuery(1, 'author', '작성자'))
      expect(response.body.length).toBe(1)
    })

    it('게시물 수정; 제목', async () => {
      // QueryBus의 execute 메서드 모킹
      commandBus.execute = jest.fn().mockResolvedValue({ title: '변경 제목', updated_at: new Date() })

      const response = await request(app.getHttpServer())
        .patch('/posts/1')
        .send({ title: '변경 제목', author: '작성자', password: '1234' })
        .expect(200)

      expect(commandBus.execute).toHaveBeenCalledWith(new EditPostCommand(1, '작성자', '1234', '변경 제목'))
      expect(response.body).toEqual({
        title: '변경 제목',
        updated_at: expect.any(String),
      })
    })

    it('게시물 수정; 내용', async () => {
      // QueryBus의 execute 메서드 모킹
      commandBus.execute = jest.fn().mockResolvedValue({ content: '변경 내용', updated_at: new Date() })

      const response = await request(app.getHttpServer())
        .patch('/posts/1')
        .send({ content: '변경 내용', author: '작성자', password: '1234' })
        .expect(200)

      expect(commandBus.execute).toHaveBeenCalledWith(new EditPostCommand(1, '작성자', '1234', undefined, '변경 내용'))
      expect(response.body).toEqual({
        content: '변경 내용',
        updated_at: expect.any(String),
      })
    })

    it('게시물 수정; 제목, 내용', async () => {
      // QueryBus의 execute 메서드 모킹
      commandBus.execute = jest.fn().mockResolvedValue({
        title: '변경 제목',
        content: '변경 내용',
        updated_at: new Date(),
      })

      const response = await request(app.getHttpServer())
        .patch('/posts/1')
        .send({
          title: '변경 제목',
          content: '변경 내용',
          author: '작성자',
          password: '1234',
        })
        .expect(200)

      expect(commandBus.execute).toHaveBeenCalledWith(
        new EditPostCommand(1, '작성자', '1234', '변경 제목', '변경 내용'),
      )
      expect(response.body).toEqual({
        title: '변경 제목',
        content: '변경 내용',
        updated_at: expect.any(String),
      })
    })

    it('게시물 삭제', async () => {
      // QueryBus의 execute 메서드 모킹
      commandBus.execute = jest.fn().mockResolvedValue({
        id: 1,
        status: POST_STATUS.DELETED,
        updated_at: new Date(),
      })

      await request(app.getHttpServer()).delete('/posts/1').send({ author: '작성자', password: '1234' }).expect(204)

      expect(commandBus.execute).toHaveBeenCalledWith(new DeletePostCommand(1, '작성자', '1234'))
    })

    it('댓글 작성', async () => {
      // CommandBus의 execute 메서드 모킹
      commandBus.execute = jest.fn().mockResolvedValue(1)

      const response = await request(app.getHttpServer())
        .post('/posts/1/comments')
        .send({ content: '내용', author: '작성자', password: '1234' })
        .expect(201)

      expect(commandBus.execute).toHaveBeenCalledWith(new CreateCommentCommand(1, '내용', '작성자', '1234'))
      expect(response.body).toEqual({ id: 1 })
    })

    it('대댓글 작성', async () => {
      // CommandBus의 execute 메서드 모킹
      commandBus.execute = jest.fn().mockResolvedValue(2)

      const response = await request(app.getHttpServer())
        .post('/posts/1/comments')
        .send({ content: '내용', author: '작성자', password: '1234', comment_id: 1 })
        .expect(201)

      expect(commandBus.execute).toHaveBeenCalledWith(new CreateCommentCommand(1, '내용', '작성자', '1234', 1))
      expect(response.body).toEqual({ id: 2 })
    })

    it('게시물 댓글 목록 조회', async () => {
      const query: GetPostCommentListDto = { page: 1 }

      // QueryBus의 execute 메서드 모킹
      queryBus.execute = jest.fn().mockResolvedValueOnce([
        {
          id: 1,
          content: '댓글 내용',
          author: '댓글 작성자',
          created_at: new Date(),
          updated_at: null,
          reply: [],
        },
      ])

      const response = await request(app.getHttpServer()).get('/posts/1/comments').query(query).expect(200)

      expect(queryBus.execute).toHaveBeenCalledWith(new GetCommentListQuery(1, 1))
      expect(response.body.length).toBe(1)
    })

    it('댓글 삭제', async () => {
      // QueryBus의 execute 메서드 모킹
      commandBus.execute = jest.fn().mockResolvedValue({
        id: 1,
        status: POST_STATUS.DELETED,
        updated_at: new Date(),
      })

      await request(app.getHttpServer())
        .delete('/posts/1/comments/1')
        .send({ author: '작성자', password: '1234' })
        .expect(204)

      expect(commandBus.execute).toHaveBeenCalledWith(new DeleteCommentCommand(1, 1, '작성자', '1234'))
    })
  })
})
