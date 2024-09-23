import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { POST_STATUS } from '../../../src/common/enums'
import { PrismaService } from '../../../src/common/prisma/prisma.service'
import { PostService } from '../../../src/modules/post/post.service'
import { Crypto } from '../../../src/utils/crypto'

describe('PostService', () => {
  let service: PostService
  let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PrismaService,
          useValue: {
            post: {
              create: jest.fn(), // PrismaService의 user.create 메서드를 모킹
            },
          },
        },
      ],
    }).compile()

    service = module.get<PostService>(PostService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('CreatePost 게시글 작성', () => {
    describe('Success', () => {
      const createdPost = {
        id: 1,
        title: '제목',
        content: '내용',
        author_name: '작성자',
        password_hash: '비밀번호',
        status: POST_STATUS.ACTIVE,
        created_at: new Date(),
        updated_at: null,
      }

      it('1. 제목, 내용, 작성자, 비밀번호가 주어지면 게시글이 정상적으로 생성된다.', async () => {
        // given
        prismaService.post.create = jest.fn().mockResolvedValue(createdPost)

        // when
        const result = await service.createPost(
          '제목',
          '내용',
          '작성자',
          'password',
        )

        // then
        expect(prismaService.post.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              title: '제목',
              content: '내용',
              author_name: '작성자',
              password_hash: expect.any(String),
            }),
          }),
        )
        expect(result).toEqual(createdPost)
      })

      it('2. 비밀번호가 해시 처리되어 저장된다.', async () => {
        // given
        const hashedPassword = Crypto.plainToSHA256('password')
        jest.spyOn(Crypto, 'plainToSHA256').mockReturnValue(hashedPassword)
        prismaService.post.create = jest.fn().mockResolvedValue(createdPost)

        // when
        await service.createPost('제목', '내용', '작성자', 'password')

        // then
        expect(Crypto.plainToSHA256).toHaveBeenCalledWith('password')
        expect(prismaService.post.create).toHaveBeenCalledWith({
          data: expect.objectContaining({ password_hash: hashedPassword }),
        })
      })
    })

    describe('Fail', () => {
      it('1. 제목이 없으면 게시글 생성에 실패한다.', async () => {
        // when
        const result = service.createPost('', '내용', '작성자', 'password')

        // then
        await expect(result).rejects.toThrowError('잘못된 요청입니다.')
        await expect(result).rejects.toThrow(BadRequestException)
      })

      it('2. 내용이 없으면 게시글 생성에 실패한다.', async () => {
        // when
        const result = service.createPost('제목', '', '작성자', 'password')

        // then
        await expect(result).rejects.toThrowError('잘못된 요청입니다.')
        await expect(result).rejects.toThrow(BadRequestException)
      })

      it('3. 작성자가 없으면 게시글 생성에 실패한다.', async () => {
        // when
        const result = service.createPost('제목', '내용', '', 'password')

        // then
        await expect(result).rejects.toThrowError('잘못된 요청입니다.')
        await expect(result).rejects.toThrow(BadRequestException)
      })

      it('4. 비밀번호가 없으면 게시글 생성에 실패한다.', async () => {
        // when
        const result = service.createPost('제목', '내용', '작성자', '')

        // then
        await expect(result).rejects.toThrowError('잘못된 요청입니다.')
        await expect(result).rejects.toThrow(BadRequestException)
      })
    })
  })
})
