import { BadRequestException, NotFoundException } from '@nestjs/common'
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
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
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

  describe('게시글 작성', () => {
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

  describe('게시글 조회', () => {
    describe('Success', () => {
      const post = { id: 1 }
      const postList = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }))

      it('1. 게시글 ID로 단일 게시글을 성공적으로 조회할 수 있다.', async () => {
        //유효한 ID를 전달하면 해당 게시글이 반환되는지 확인.
        // given
        prismaService.post.findUnique = jest.fn().mockResolvedValue(post)

        // when
        const result = await service.getPostById(1)

        // then
        expect(prismaService.post.findUnique).toHaveBeenCalled()
        expect(prismaService.post.findUnique).toHaveBeenCalledWith(expect.objectContaining({
          where: {
            id: 1,
            status: POST_STATUS.ACTIVE,
          },
        }))
        expect(result).toEqual(post)
      })

      it('2. 게시글 목록을 성공적으로 조회할 수 있다.', async () => {
        // given
        prismaService.post.findMany = jest.fn().mockResolvedValue(postList.reverse())

        // when
        const result = await service.getPostList({})

        // then
        expect(prismaService.post.findMany).toHaveBeenCalled()
        expect(prismaService.post.findMany).toHaveBeenCalledWith(expect.objectContaining({
          where: { status: POST_STATUS.ACTIVE },
          orderBy: { id: 'desc' },
          skip: 0,
          take: 10,
        }))
        expect(result).toEqual(postList)
        Array(10).forEach((_, i) => {
          expect(result[i].id).toEqual(10 - i)
        })
      })

      it('3. 게시글 목록을 5개 요청하면 성공적으로 조회할 수 있다.', async () => {
        // given
        prismaService.post.findMany = jest.fn().mockResolvedValue(postList.reverse().slice(0, 5))

        // when
        const result = await service.getPostList({}, 1, 5)

        // then
        expect(prismaService.post.findMany).toHaveBeenCalled()
        expect(prismaService.post.findMany).toHaveBeenCalledWith(expect.objectContaining({
          where: { status: POST_STATUS.ACTIVE },
          orderBy: { id: 'desc' },
          skip: 0,
          take: 5,
        }))
        expect(result.length).toEqual(5)
        Array(5).forEach((_, i) => {
          expect(result[i].id).toEqual(10 - i)
        })
      })

      it('4. 제목으로 게시글을 검색할 수 있다.', async () => {
        // given
        prismaService.post.findMany = jest.fn().mockResolvedValue(postList)

        // when
        const result = await service.getPostList({ title: '제목' })

        // then
        expect(prismaService.post.findMany).toHaveBeenCalled()
        expect(prismaService.post.findMany).toHaveBeenCalledWith(expect.objectContaining({
          where: { title: { contains: '제목' }, status: POST_STATUS.ACTIVE },
          orderBy: { id: 'desc' },
          skip: 0,
          take: 10,
        }))
        expect(result).toEqual(postList)
      })

      it('5. 작성자로 게시글을 검색할 수 있다.', async () => {
        //특정 작성자가 작성한 게시글들이 필터링되어 반환되는지 확인.
        // given
        prismaService.post.findMany = jest.fn().mockResolvedValue(postList)

        // when
        const result = await service.getPostList({ author: '작성자' })

        // then
        expect(prismaService.post.findMany).toHaveBeenCalled()
        expect(prismaService.post.findMany).toHaveBeenCalledWith(expect.objectContaining({
          where: { author_name: { contains: '작성자' }, status: POST_STATUS.ACTIVE },
          orderBy: { id: 'desc' },
          skip: 0,
          take: 10,
        }))
        expect(result).toEqual(postList)
      })

      it('6. 게시글 목록의 정렬을 오름차순으로 성공적으로 조회할 수 있다.', async () => {
        //특정 작성자가 작성한 게시글들이 필터링되어 반환되는지 확인.
        // given
        prismaService.post.findMany = jest.fn().mockResolvedValue(postList)

        // when
        const result = await service.getPostList({ order: 'asc' })

        // then
        expect(prismaService.post.findMany).toHaveBeenCalled()
        expect(prismaService.post.findMany).toHaveBeenCalledWith(expect.objectContaining({
          where: { status: POST_STATUS.ACTIVE },
          orderBy: { id: 'asc' },
          skip: 0,
          take: 10,
        }))
        expect(result).toEqual(postList)
      })
    })

    describe('Fail', () => {
      it('1. 존재하지 않는 ID로 조회하면 오류가 발생한다.', async () => {
        //유효하지 않은 ID로 조회 시 예외가 발생하는지 확인.
        // given
        prismaService.post.findUnique = jest.fn().mockResolvedValue(undefined)

        // when
        const result = service.getPostById(99999)

        // then
        await expect(result).rejects.toThrowError('존재하지 않는 게시물입니다.')
        await expect(result).rejects.toThrow(NotFoundException)
      })
    })
  })
})
