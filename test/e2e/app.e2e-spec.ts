import { INestApplication } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'
import { CreatePostCommand } from '../../src/modules/post/commands/create-post.command'
import { CreatePostDto } from '../../src/modules/post/dto'

describe('AppController (e2e)', () => {
  let app: INestApplication
  let commandBus: CommandBus

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CommandBus)
      .useValue({
        register: jest.fn(), // CommandBus load를 위해 모킹
        execute: jest.fn(), // CommandBus의 execute 메서드를 모킹
      })
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
    commandBus = moduleFixture.get<CommandBus>(CommandBus)
  })

  it('/health (GET)', () => {
    return request(app.getHttpServer()).get('/health').expect(200).expect('OK')
  })

  describe('PostController', () => {
    it('게시물 작성', async () => {
      const body: CreatePostDto = {
        title: '제목',
        content: '내용',
        author: '작성자',
        password: '1234',
      }

      // CommandBus의 execute 메서드 모킹
      commandBus.execute = jest.fn().mockResolvedValue(1)

      const response = await request(app.getHttpServer())
        .post('/posts')
        .send(body)
        .expect(201)

      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreatePostCommand(
          body.title,
          body.content,
          body.author,
          body.password,
        ),
      )
      expect(response.body).toEqual({ id: 1 })
    })
  })
})
