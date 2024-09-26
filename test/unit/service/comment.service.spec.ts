import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { COMMENT_STATUS, POST_STATUS } from '../../../src/common/enums'
import { PrismaService } from '../../../src/common/prisma/prisma.service'
import { CommentService } from '../../../src/modules/comment/comment.service'
import { Crypto } from '../../../src/utils/crypto'
import Mocker from '../../lib/mock'

describe('CommentService', () => {
  let service: CommentService
  let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: PrismaService,
          useValue: {
            post: {
              findUnique: jest.fn(),
            },
            comments: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              groupBy: jest.fn(),
            },
          },
        },
      ],
    }).compile()

    service = module.get<CommentService>(CommentService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('댓글 작성', () => {
    describe('Success', () => {
      const createdComment = Mocker.comment

      it('1.게시물 ID, 댓글 내용, 작성자, 비밀번호가 주어지면 댓글이 정상적으로 생성된다.', async () => {
        // given
        prismaService.post.findUnique = jest.fn().mockResolvedValue(Mocker.post)
        prismaService.comments.create = jest.fn().mockResolvedValue(createdComment)

        // when
        const result = await service.createComment(1, '내용', '작성자', 'password')

        // then
        expect(prismaService.post.findUnique).toHaveBeenCalledWith({
          where: expect.objectContaining({ id: 1, status: POST_STATUS.ACTIVE }),
        })
        expect(prismaService.comments.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              post_id: 1,
              content: '내용',
              author_name: '작성자',
              password_hash: expect.any(String),
            }),
          }),
        )
        expect(result).toEqual(createdComment)
      })

      it('2.비밀번호는 해시 처리되어 저장된다.', async () => {
        // given
        const hashedPassword = await Crypto.plainToHash('password')
        jest.spyOn(Crypto, 'plainToHash').mockResolvedValueOnce(hashedPassword)
        prismaService.post.findUnique = jest.fn().mockResolvedValue(Mocker.post)
        prismaService.comments.create = jest.fn().mockResolvedValue(createdComment)

        // when
        await service.createComment(1, '내용', '작성자', 'password')

        // then
        expect(Crypto.plainToHash).toHaveBeenCalledWith('password')
        expect(prismaService.post.findUnique).toHaveBeenCalledWith({
          where: expect.objectContaining({ id: 1, status: POST_STATUS.ACTIVE }),
        })
        expect(prismaService.comments.create).toHaveBeenCalledWith({
          data: expect.objectContaining({ password_hash: hashedPassword }),
        })
      })

      it('3.댓글의 대댓글도 작성할 수 있으며, 부모 댓글 ID가 주어지면 자식 댓글이 추가된다.', async () => {
        // given
        const childComment = Mocker.childComment
        prismaService.post.findUnique = jest.fn().mockResolvedValue(Mocker.post)
        prismaService.comments.findUnique = jest.fn().mockResolvedValue(Mocker.comment)
        prismaService.comments.create = jest.fn().mockResolvedValue(childComment)

        // when
        const result = await service.createComment(1, '대댓글 내용', '대댓글 작성자', 'password', 1)

        // then
        expect(prismaService.post.findUnique).toHaveBeenCalledWith({
          where: expect.objectContaining({ id: 1, status: POST_STATUS.ACTIVE }),
        })
        expect(prismaService.comments.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            post_id: 1,
            parent_id: 1,
            content: '대댓글 내용',
            author_name: '대댓글 작성자',
            password_hash: expect.any(String),
          }),
        })
        expect(result).toBe(childComment)
      })
    })

    describe('Fail', () => {
      it('1.게시물이 없으면 댓글 생성에 실패한다.', async () => {
        // given
        prismaService.post.findUnique = jest.fn().mockResolvedValueOnce(undefined)

        // when
        const result = service.createComment(99999, '내용', '작성자', 'password')

        // then
        await expect(result).rejects.toThrowError('존재하지 않는 게시물입니다.')
        await expect(result).rejects.toThrow(NotFoundException)
        expect(prismaService.post.findUnique).toHaveBeenCalledTimes(1)
      })

      it('2.댓글 내용이 없으면 생성에 실패한다.', async () => {
        // when
        const result = service.createComment(1, '', '작성자', 'password')

        // then
        await expect(result).rejects.toThrowError('잘못된 요청입니다.')
        await expect(result).rejects.toThrow(BadRequestException)
      })

      it('3.작성자가 없으면 생성에 실패한다.', async () => {
        // when
        const result = service.createComment(1, '내용', '', 'password')

        // then
        await expect(result).rejects.toThrowError('잘못된 요청입니다.')
        await expect(result).rejects.toThrow(BadRequestException)
      })

      it('4.비밀번호가 없으면 생성에 실패한다.', async () => {
        // when
        const result = service.createComment(1, '내용', '작성자', '')

        // then
        await expect(result).rejects.toThrowError('잘못된 요청입니다.')
        await expect(result).rejects.toThrow(BadRequestException)
      })

      it('5.댓글이 없다면 대댓글 생성에 실패한다.', async () => {
        // given
        prismaService.post.findUnique = jest.fn().mockResolvedValue(Mocker.post)
        prismaService.comments.findUnique = jest.fn().mockResolvedValue(undefined)

        // when
        const result = service.createComment(1, '내용', '작성자', '1234', 99999)

        // then
        await expect(result).rejects.toThrowError('댓글이 존재하지 않습니다.')
        await expect(result).rejects.toThrow(NotFoundException)
        expect(prismaService.post.findUnique).toHaveBeenCalledTimes(1)
        expect(prismaService.comments.findUnique).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('댓글 조회', () => {
    const commentList = Mocker.allCommentList
    const replyList = Mocker.childCommentList

    describe('Success', () => {
      it('1.특정 게시물 ID에 대한 전체 댓글 목록을 정상적으로 조회한다.', async () => {
        // given
        prismaService.comments.findMany = jest.fn().mockResolvedValueOnce(commentList)

        // when
        const result = await service.getCommentList(1)

        // then
        expect(prismaService.comments.findMany).toHaveBeenCalledTimes(1)
        expect(prismaService.comments.findMany).toHaveBeenNthCalledWith(1,
          expect.objectContaining({
            where: { post_id: 1, status: COMMENT_STATUS.ACTIVE },
            orderBy: { id: 'desc' },
            skip: 0,
            take: 10,
          }),
        )
        expect(result).toEqual(commentList)
        result.forEach(({ id }, idx) => {
          expect(id).toBe(10 - idx)
        })
      })

      it('2.댓글 목록은 페이징 처리한다.', async () => {
        // given
        prismaService.comments.findMany = jest.fn().mockResolvedValueOnce(commentList.slice(0, 5))

        // when
        const result = await service.getCommentList(1, 'desc', 1, 5)

        // then
        expect(prismaService.comments.findMany).toHaveBeenCalledTimes(1)
        expect(prismaService.comments.findMany).toHaveBeenNthCalledWith(1,
          expect.objectContaining({
            where: { post_id: 1, status: COMMENT_STATUS.ACTIVE },
            orderBy: { id: 'desc' },
            skip: 0,
            take: 5,
          }),
        )
        expect(result.length).toBe(5)
        result.forEach(({ id }, idx) => {
          expect(id).toBe(10 - idx)
        })
      })

      it('3.댓글 목록을 오름차순으로 조회한다.', async () => {
        // given
        prismaService.comments.findMany = jest.fn().mockResolvedValueOnce(commentList.reverse())

        // when
        const result = await service.getCommentList(1, 'asc')

        // then
        expect(prismaService.comments.findMany).toHaveBeenCalledTimes(1)
        expect(prismaService.comments.findMany).toHaveBeenNthCalledWith(1,
          expect.objectContaining({
            where: { post_id: 1, status: COMMENT_STATUS.ACTIVE },
            orderBy: { id: 'asc' },
            skip: 0,
            take: 10,
          }),
        )
        expect(result).toEqual(commentList)
        result.forEach(({ id }, idx) => {
          expect(id).toBe(idx + 1)
        })
      })

      it('4.부모댓글을 조회할 수 있다.', async () => {
        // given
        prismaService.comments.findMany = jest.fn().mockResolvedValue(commentList)

        // when
        const result = await service.getParentCommentList(1)

        // then
        expect(prismaService.comments.findMany).toHaveBeenCalled()
        expect(prismaService.comments.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { post_id: 1, parent_id: null, status: COMMENT_STATUS.ACTIVE },
            orderBy: { id: 'desc' },
            skip: 0,
            take: 10,
          }),
        )
        expect(result.length).toBe(10)
        result.forEach(({ id, parent_id }, idx) => {
          expect(id).toBe(idx + 1)
          expect(parent_id).toBe(null)
        })
      })

      it('5.부모댓글 목록은 페이징 처리한다.', async () => {
        // given
        prismaService.comments.findMany = jest.fn().mockResolvedValue(commentList.slice(0, 5))

        // when
        const result = await service.getParentCommentList(1, 'desc', 1, 5)

        // then
        expect(prismaService.comments.findMany).toHaveBeenCalled()
        expect(prismaService.comments.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { post_id: 1, parent_id: null, status: COMMENT_STATUS.ACTIVE },
            orderBy: { id: 'desc' },
            skip: 0,
            take: 5,
          }),
        )
        expect(result.length).toBe(5)
        result.forEach(({ id, parent_id }, idx) => {
          expect(id).toBe(idx + 1)
          expect(parent_id).toBe(null)
        })
      })

      it('6.부모댓글 목록을 오름차순으로 조회한다.', async () => {
        // given
        prismaService.comments.findMany = jest.fn().mockResolvedValue(commentList.reverse())

        // when
        const result = await service.getParentCommentList(1, 'asc', 1, 5)

        // then
        expect(prismaService.comments.findMany).toHaveBeenCalled()
        expect(prismaService.comments.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { post_id: 1, parent_id: null, status: COMMENT_STATUS.ACTIVE },
            orderBy: { id: 'asc' },
            skip: 0,
            take: 5,
          }),
        )
        expect(result).toBe(commentList)
        result.forEach(({ id, parent_id }, idx) => {
          expect(id).toBe(10 - idx)
          expect(parent_id).toBe(null)
        })
      })

      it('7.자식댓글 목록을 조회한다.', async () => {
        // given
        const commentIdList = Array.from({ length: 10 }, (_, i) => i + 1)
        prismaService.comments.findMany = jest.fn().mockResolvedValue(replyList)

        // when
        const result = await service.getChildCommentList(commentIdList)

        // then
        expect(prismaService.comments.findMany).toHaveBeenCalled()
        expect(prismaService.comments.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: { in: commentIdList }, parent_id: { not: null }, status: COMMENT_STATUS.ACTIVE },
            orderBy: { id: 'desc' },
          }),
        )
        expect(result).toEqual(replyList)
        result.forEach(({ parent_id }) => {
          expect(parent_id).not.toBe(null)
        })
      })

      it('8.부모댓글과 자식댓글이 조립된 목록을 조회한다.', async () => {
        // given
        prismaService.comments.findMany = jest.fn()
          .mockResolvedValueOnce(commentList)
          .mockResolvedValueOnce(replyList)

        // when
        const result = await service.getNestedCommentList(1)

        // then
        expect(prismaService.comments.findMany).toHaveBeenCalledTimes(2)
        expect(prismaService.comments.findMany).toHaveBeenNthCalledWith(1,
          expect.objectContaining({
            where: { post_id: 1, parent_id: null, status: COMMENT_STATUS.ACTIVE },
            orderBy: { id: 'desc' },
            skip: 0,
            take: 10,
          }),
        )
        expect(prismaService.comments.findMany).toHaveBeenNthCalledWith(2,
          expect.objectContaining({
            where: { id: { in: expect.any(Array) }, parent_id: { not: null }, status: COMMENT_STATUS.ACTIVE },
            orderBy: { id: 'desc' },
          }),
        )
        expect(result.length).toBe(10)
      })

      it('9.전체 댓글 갯수를 조회한다.', async () => {
        // given
        const postIds = commentList.map(({ post_id }) => post_id)
        prismaService.comments.groupBy = jest.fn().mockResolvedValueOnce([
          { _count: { id: 4 }, post_id: 1 },
          { _count: { id: 2 }, post_id: 2 },
        ])

        // when
        const result = await service.getCommentCounts(postIds)

        // then
        expect(prismaService.comments.groupBy).toHaveBeenCalledTimes(1)
        expect(prismaService.comments.groupBy).toHaveBeenNthCalledWith(1,
          expect.objectContaining({
            by: 'post_id',
            where: { post_id: { in: postIds }, status: COMMENT_STATUS.ACTIVE },
            _count: { id: true },
          }),
        )
        expect(result).toEqual(new Map([[1, 4], [2, 2]]))
      })
    })
  })

  describe('댓글 삭제', () => {
    describe('Success', () => {
      const updated = Mocker.updatedAt
      const deletedComment = Mocker.deletedComment

      it('1.댓글 ID와 비밀번호가 주어지면 댓글이 정상적으로 삭제된다.', async () => {
        // given
        prismaService.comments.findUnique = jest.fn().mockResolvedValue({
          password_hash: await Crypto.plainToHash('password'),
        })
        prismaService.comments.update = jest.fn().mockResolvedValue(deletedComment)

        // when
        const result = await service.softDeleteComment(1, 1, '작성자', 'password')

        // then
        expect(prismaService.comments.findUnique).toHaveBeenCalledWith({
          where: { id: 1, post_id: 1, author_name: '작성자', status: COMMENT_STATUS.ACTIVE },
        })
        expect(prismaService.comments.update).toHaveBeenCalledWith({
          where: { id: 1 },
          data: expect.objectContaining({ status: COMMENT_STATUS.DELETED, updated_at: expect.any(Date) }),
        })
        expect(result).toEqual(
          expect.objectContaining({
            status: COMMENT_STATUS.DELETED,
            updated_at: updated,
          }),
        )
      })
    })

    describe('Fail', () => {
      it('1.존재하지 않는 댓글은 삭제에 실패한다.', async () => {
        // given
        prismaService.comments.findUnique = jest.fn().mockResolvedValueOnce(undefined)

        // when
        const result = service.softDeleteComment(1, 1, '작성자', 'password')

        // then
        expect(prismaService.comments.findUnique).toHaveBeenCalledTimes(1)
        await expect(result).rejects.toThrowError('댓글이 존재하지 않습니다.')
        await expect(result).rejects.toThrow(NotFoundException)
      })

      it('2.비밀번호가 맞지 않으면 삭제에 실패한다.', async () => {
        // given
        const encrypted = await Crypto.plainToHash('password')
        prismaService.comments.findUnique = jest.fn().mockResolvedValueOnce({ password_hash: encrypted })

        // when
        const result = service.softDeleteComment(1, 1, '작성자', 'PassWord')

        // then
        expect(prismaService.comments.findUnique).toHaveBeenCalledTimes(1)
        await expect(result).rejects.toThrowError('비밀번호가 틀렸습니다.')
        await expect(result).rejects.toThrow(BadRequestException)
      })
    })
  })
})
