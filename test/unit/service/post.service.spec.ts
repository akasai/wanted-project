import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { POST_STATUS } from '../../../src/common/enums'
import { PrismaService } from '../../../src/common/prisma/prisma.service'
import { PostService } from '../../../src/modules/post/post.service'
import { Crypto } from '../../../src/utils/crypto'
import Mocker from '../../lib/mock'

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
              update: jest.fn(),
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
      const createdPost = Mocker.post

      it('1. 제목, 내용, 작성자, 비밀번호가 주어지면 게시글이 정상적으로 생성된다.', async () => {
        // given
        prismaService.post.create = jest.fn().mockResolvedValue(createdPost)

        // when
        const result = await service.createPost('제목', '내용', '작성자', 'password')

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
        const hashedPassword = await Crypto.plainToHash('password')
        jest.spyOn(Crypto, 'plainToHash').mockResolvedValueOnce(hashedPassword)
        prismaService.post.create = jest.fn().mockResolvedValue(createdPost)

        // when
        await service.createPost('제목', '내용', '작성자', 'password')

        // then
        expect(Crypto.plainToHash).toHaveBeenCalledWith('password')
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
      const post = Mocker.post
      const postList = Mocker.postListDesc

      it('1. 게시글 ID로 단일 게시글을 성공적으로 조회할 수 있다.', async () => {
        // given
        prismaService.post.findUnique = jest.fn().mockResolvedValue(post)

        // when
        const result = await service.getPostById(1)

        // then
        expect(prismaService.post.findUnique).toHaveBeenCalled()
        expect(prismaService.post.findUnique).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: 1, status: POST_STATUS.ACTIVE },
          }),
        )
        expect(result).toBe(post)
      })

      it('2. 게시글 목록을 성공적으로 조회할 수 있다.', async () => {
        // given
        prismaService.post.findMany = jest.fn().mockResolvedValue(postList)

        // when
        const result = await service.getPostList({})

        // then
        expect(prismaService.post.findMany).toHaveBeenCalledTimes(1)
        expect(prismaService.post.findMany).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            where: { status: POST_STATUS.ACTIVE },
            orderBy: { id: 'desc' },
            skip: 0,
            take: 10,
          }),
        )
        expect(result).toEqual(postList)
        result.forEach(({ id }, idx) => {
          expect(id).toBe(10 - idx)
        })
      })

      it('3. 게시글 목록을 5개 요청하면 성공적으로 조회할 수 있다.', async () => {
        // given
        prismaService.post.findMany = jest.fn().mockResolvedValue(postList.slice(0, 5))

        // when
        const result = await service.getPostList({}, 1, 5)

        // then
        expect(prismaService.post.findMany).toHaveBeenCalledTimes(1)
        expect(prismaService.post.findMany).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            where: { status: POST_STATUS.ACTIVE },
            orderBy: { id: 'desc' },
            skip: 0,
            take: 5,
          }),
        )
        expect(result.length).toEqual(5)
        result.forEach(({ id }, idx) => {
          expect(id).toBe(10 - idx)
        })
      })

      it('4. 제목으로 게시글을 검색할 수 있다.', async () => {
        // given
        prismaService.post.findMany = jest.fn().mockResolvedValue(postList)

        // when
        const result = await service.getPostList({ title: '제목' })

        // then
        expect(prismaService.post.findMany).toHaveBeenCalledTimes(1)
        expect(prismaService.post.findMany).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            where: { title: { contains: '제목' }, status: POST_STATUS.ACTIVE },
            orderBy: { id: 'desc' },
            skip: 0,
            take: 10,
          }),
        )
        expect(result).toEqual(postList)
      })

      it('5. 작성자로 게시글을 검색할 수 있다.', async () => {
        // given
        prismaService.post.findMany = jest.fn().mockResolvedValue(postList)

        // when
        const result = await service.getPostList({ author: '작성자' })

        // then
        expect(prismaService.post.findMany).toHaveBeenCalledTimes(1)
        expect(prismaService.post.findMany).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            where: { author_name: { contains: '작성자' }, status: POST_STATUS.ACTIVE },
            orderBy: { id: 'desc' },
            skip: 0,
            take: 10,
          }),
        )
        expect(result).toEqual(postList)
      })

      it('6. 게시글 목록의 정렬을 오름차순으로 성공적으로 조회할 수 있다.', async () => {
        // given
        prismaService.post.findMany = jest.fn().mockResolvedValue(postList)

        // when
        const result = await service.getPostList({ order: 'asc' })

        // then
        expect(prismaService.post.findMany).toHaveBeenCalledTimes(1)
        expect(prismaService.post.findMany).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            where: { status: POST_STATUS.ACTIVE },
            orderBy: { id: 'asc' },
            skip: 0,
            take: 10,
          }),
        )
        expect(result).toEqual(postList)
      })
    })

    describe('Fail', () => {
      it('1. 존재하지 않는 ID로 조회하면 오류가 발생한다.', async () => {
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

  describe('게시글 수정', () => {
    const updated = Mocker.updatedAt
    const updatedPost = Mocker.updatedPost

    describe('Success', () => {
      it('1. 비밀번호가 맞으면 내용을 성공적으로 수정할 수 있다.', async () => {
        // given
        prismaService.post.findUnique = jest.fn().mockResolvedValue({
          password_hash: await Crypto.plainToHash('password'),
        })
        prismaService.post.update = jest.fn().mockResolvedValue(updatedPost)

        // when
        const result = await service.updatePost(1, '작성자', 'password', {
          title: '',
          content: '내용 변경',
        })

        // then
        expect(prismaService.post.findUnique).toHaveBeenCalledWith({
          where: { id: 1, author_name: '작성자', status: POST_STATUS.ACTIVE },
        })
        expect(prismaService.post.update).toHaveBeenCalledWith({
          where: { id: 1, author_name: '작성자', status: POST_STATUS.ACTIVE },
          data: expect.objectContaining({
            content: '내용 변경',
            updated_at: expect.any(Date),
          }),
        })
        expect(result).toEqual(
          expect.objectContaining({
            content: '내용 변경',
            updated_at: updated,
          }),
        )
      })

      it('2. 비밀번호가 맞으면 제목을 성공적으로 수정할 수 있다.', async () => {
        // given
        prismaService.post.findUnique = jest.fn().mockResolvedValue({
          password_hash: await Crypto.plainToHash('password'),
        })
        prismaService.post.update = jest.fn().mockResolvedValue(updatedPost)

        // when
        const result = await service.updatePost(1, '작성자', 'password', {
          title: '제목 변경',
          content: '',
        })

        // then
        expect(prismaService.post.findUnique).toHaveBeenCalledWith({
          where: { id: 1, author_name: '작성자', status: POST_STATUS.ACTIVE },
        })
        expect(prismaService.post.update).toHaveBeenCalledWith({
          where: { id: 1, author_name: '작성자', status: POST_STATUS.ACTIVE },
          data: expect.objectContaining({
            title: '제목 변경',
            updated_at: expect.any(Date),
          }),
        })
        expect(result).toEqual(expect.objectContaining({ title: '제목 변경', updated_at: updated }))
      })

      it('3. 비밀번호가 맞으면 게시물을 성공적으로 수정할 수 있다.', async () => {
        // given
        prismaService.post.findUnique = jest.fn().mockResolvedValue({
          password_hash: await Crypto.plainToHash('password'),
        })
        prismaService.post.update = jest.fn().mockResolvedValue(updatedPost)

        // when
        const result = await service.updatePost(1, '작성자', 'password', {
          title: '제목 변경',
          content: '내용 변경',
        })

        // then
        expect(prismaService.post.findUnique).toHaveBeenCalledWith({
          where: { id: 1, author_name: '작성자', status: POST_STATUS.ACTIVE },
        })
        expect(prismaService.post.update).toHaveBeenCalledWith({
          where: { id: 1, author_name: '작성자', status: POST_STATUS.ACTIVE },
          data: expect.objectContaining({
            title: '제목 변경',
            content: '내용 변경',
            updated_at: expect.any(Date),
          }),
        })
        expect(result).toEqual(
          expect.objectContaining({
            title: '제목 변경',
            content: '내용 변경',
            updated_at: updated,
          }),
        )
      })

      it('4. 수정 시 updated_at 필드가 갱신된다.', async () => {
        // given
        prismaService.post.findUnique = jest.fn().mockResolvedValue({
          password_hash: await Crypto.plainToHash('password'),
        })
        prismaService.post.update = jest.fn().mockResolvedValue(updatedPost)

        // when
        const result = await service.updatePost(1, '작성자', 'password', {
          title: '제목 변경',
          content: '내용 변경',
        })

        // then
        expect(prismaService.post.findUnique).toHaveBeenCalledWith({
          where: { id: 1, author_name: '작성자', status: POST_STATUS.ACTIVE },
        })
        expect(prismaService.post.update).toHaveBeenCalledWith({
          where: { id: 1, author_name: '작성자', status: POST_STATUS.ACTIVE },
          data: expect.objectContaining({
            title: '제목 변경',
            content: '내용 변경',
            updated_at: expect.any(Date),
          }),
        })
        expect(result.updated_at).toEqual(updated)
      })
    })

    describe('Fail', () => {
      it('1. 비밀번호가 틀리면 게시글 수정에 실패한다.', async () => {
        // given
        const encrypted = await Crypto.plainToHash('password')
        prismaService.post.findUnique = jest.fn().mockResolvedValueOnce({ password_hash: encrypted })

        // when
        const result = service.updatePost(1, '작성자', '111', {
          title: '제목 변경',
          content: '',
        })

        // then
        expect(prismaService.post.findUnique).toHaveBeenCalledTimes(1)
        await expect(result).rejects.toThrowError('비밀번호가 틀렸습니다.')
        await expect(result).rejects.toThrow(BadRequestException)
      })

      it('2. 존재하지 않는 게시글을 수정하려고 하면 오류가 발생한다.', async () => {
        // given
        prismaService.post.findUnique = jest.fn().mockResolvedValueOnce(undefined)

        // when
        const result = service.updatePost(99999, '작성자', 'password', {
          title: '제목 변경',
          content: '',
        })

        // then
        expect(prismaService.post.findUnique).toHaveBeenCalledTimes(1)
        await expect(result).rejects.toThrowError('게시글이 존재하지 않습니다.')
        await expect(result).rejects.toThrow(NotFoundException)
      })

      it('3. 수정할 때 제목, 내용이 없으면 오류가 발생한다.', async () => {
        // given
        prismaService.post.findUnique = jest.fn().mockResolvedValueOnce({
          password_hash: await Crypto.plainToHash('password'),
        })
        prismaService.post.update = jest.fn().mockResolvedValueOnce(undefined)

        // when
        const result = service.updatePost(1, '작성자', 'password', {
          title: '',
          content: '',
        })

        // then
        expect(prismaService.post.findUnique).toHaveBeenCalledTimes(0)
        expect(prismaService.post.update).toHaveBeenCalledTimes(0)
        await expect(result).rejects.toThrowError('잘못된 요청입니다.')
        await expect(result).rejects.toThrow(BadRequestException)
      })
    })
  })

  describe('게시글 삭제', () => {
    describe('Success', () => {
      const deletedPost = Mocker.deletedPost

      it('1. 비밀번호가 맞으면 게시글을 성공적으로 삭제할 수 있다.', async () => {
        // given
        prismaService.post.findUnique = jest.fn().mockResolvedValue({
          password_hash: await Crypto.plainToHash('password'),
        })
        prismaService.post.update = jest.fn().mockResolvedValue(deletedPost)

        // when
        const result = await service.softDeletePost(1, '작성자', 'password')

        // then
        expect(prismaService.post.findUnique).toHaveBeenCalledWith({
          where: { id: 1, author_name: '작성자', status: POST_STATUS.ACTIVE },
        })
        expect(prismaService.post.update).toHaveBeenCalledWith({
          where: { id: 1, author_name: '작성자', status: POST_STATUS.ACTIVE },
          data: expect.objectContaining({ status: POST_STATUS.DELETED, updated_at: expect.any(Date) }),
        })
        expect(result).toEqual(
          expect.objectContaining({ status: POST_STATUS.DELETED, updated_at: deletedPost.updated_at }),
        )
      })
    })

    describe('Fail', () => {
      it('1. 비밀번호가 틀리면 게시글 삭제에 실패한다.', async () => {
        // given
        const encrypted = await Crypto.plainToHash('password')
        prismaService.post.findUnique = jest.fn().mockResolvedValueOnce({ password_hash: encrypted })

        // when
        const result = service.softDeletePost(1, '작성자', 'PassWord')

        // then
        expect(prismaService.post.findUnique).toHaveBeenCalledTimes(1)
        await expect(result).rejects.toThrowError('비밀번호가 틀렸습니다.')
        await expect(result).rejects.toThrow(BadRequestException)
      })

      it('2. 존재하지 않는 게시글을 삭제하려고 하면 오류가 발생한다.', async () => {
        // given
        prismaService.post.findUnique = jest.fn().mockResolvedValueOnce(undefined)

        // when
        const result = service.softDeletePost(1, '작성자', 'PassWord')

        // then
        expect(prismaService.post.findUnique).toHaveBeenCalledTimes(1)
        await expect(result).rejects.toThrowError('게시글이 존재하지 않습니다.')
        await expect(result).rejects.toThrow(NotFoundException)
      })
    })
  })
})
