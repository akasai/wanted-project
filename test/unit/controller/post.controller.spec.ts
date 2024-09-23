import { CommandBus } from '@nestjs/cqrs'
import { Test, TestingModule } from '@nestjs/testing'
import { CreatePostCommand } from '../../../src/modules/post/commands/create-post.command'
import { CreatePostDto } from '../../../src/modules/post/dto'
import { PostController } from '../../../src/modules/post/post.controller'

describe('PostController', () => {
  let controller: PostController
  let commandBus: CommandBus

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
      ],
    }).compile()

    controller = module.get<PostController>(PostController)
    commandBus = module.get<CommandBus>(CommandBus)
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

      commandBus.execute = jest.fn().mockResolvedValue(1)

      const result = await controller.createPost(body)

      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreatePostCommand(
          body.title,
          body.content,
          body.author,
          body.password,
        ),
      )
      expect(result).toEqual({ id: 1 })
    })
  })
})
