import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { COMMENT_STATUS, POST_STATUS } from '../../common/enums'
import { PrismaService } from '../../common/prisma/prisma.service'
import { Crypto } from '../../utils/crypto'
import { NestedComment } from './models/comment'
import { comments as Comments, post as Post } from '.prisma/client'

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async getCommentCounts(postIds: number[]) {
    const list = await this.prisma.comments.groupBy({
      _count: { id: true },
      where: { post_id: { in: postIds }, status: COMMENT_STATUS.ACTIVE },
      by: 'post_id',
    })
    return list.reduce((m, { post_id, _count }) => {
      m.set(post_id, _count.id)
      return m
    }, new Map<number, number>())
  }

  async getCommentList(
    postId: number,
    order: 'asc' | 'desc' = 'desc',
    page: number = 1,
    size: number = 10,
  ): Promise<Array<Comments>> {
    return this.prisma.comments.findMany({
      where: { post_id: postId, status: COMMENT_STATUS.ACTIVE },
      orderBy: { id: order || 'desc' },
      skip: (page - 1) * size, // 건너뛸 게시물 수
      take: size, // 한 페이지에 표시할 게시물 수
    })
  }

  async getParentCommentList(
    postId: number,
    order: 'asc' | 'desc' = 'desc',
    page: number = 1,
    size: number = 10,
  ): Promise<Array<Comments>> {
    return this.prisma.comments.findMany({
      where: { post_id: postId, parent_id: null, status: COMMENT_STATUS.ACTIVE },
      orderBy: { id: order || 'desc' },
      skip: (page - 1) * size, // 건너뛸 게시물 수
      take: size, // 한 페이지에 표시할 게시물 수
    })
  }

  async getChildCommentList(postId: number, ids: number[]): Promise<Array<Comments>> {
    return this.prisma.comments.findMany({
      where: { post_id: postId, parent_id: { in: ids }, status: COMMENT_STATUS.ACTIVE },
      orderBy: { id: 'desc' },
    })
  }

  async getNestedCommentList(
    postId: number,
    order: 'asc' | 'desc' = 'desc',
    page: number = 1,
    size: number = 10,
  ): Promise<NestedComment> {
    const parentList = await this.getParentCommentList(postId, order, page, size)

    const commentIds = parentList.map(({ id }) => id)
    const childList = await this.getChildCommentList(postId, commentIds)

    const childMap = childList.reduce((m, o) => {
      const parentId = o.parent_id
      if (m.has(parentId)) m.get(parentId).push(o)
      else m.set(parentId, [o])
      return m
    }, new Map<number, Array<Comments>>())

    return parentList.map((comment) => ({
      ...comment,
      reply: childMap.get(comment.id) || [],
    }))
  }

  async createComment(
    postId: number,
    content: string,
    author: string,
    password: string,
    commentId?: number,
  ): Promise<Comments> {
    if (!(content && author && password)) {
      throw new BadRequestException('잘못된 요청입니다.')
    }

    const post: Post = await this.prisma.post.findUnique({
      where: { id: postId, status: POST_STATUS.ACTIVE },
    })
    if (!post) {
      throw new NotFoundException('존재하지 않는 게시물입니다.')
    }

    if (commentId) {
      const parent: Comments = await this.prisma.comments.findUnique({
        where: { id: commentId, status: COMMENT_STATUS.ACTIVE },
      })
      if (!parent) {
        throw new NotFoundException('댓글이 존재하지 않습니다.')
      }
    }

    return this.prisma.comments.create({
      data: {
        post_id: postId,
        parent_id: commentId || null,
        content,
        author_name: author,
        password_hash: await Crypto.plainToHash(password),
      },
    })
  }

  async softDeleteComment(commentId: number, postId: number, author: string, password: string): Promise<Comments> {
    const comment = await this.prisma.comments.findUnique({
      where: { id: commentId, post_id: postId, author_name: author, status: COMMENT_STATUS.ACTIVE },
    })

    if (!comment) {
      throw new NotFoundException('댓글이 존재하지 않습니다.')
    }

    if (!(await Crypto.isMatchedEncrypted(password, comment.password_hash))) {
      throw new BadRequestException('비밀번호가 틀렸습니다.')
    }

    return this.prisma.comments.update({
      where: { id: commentId },
      data: { status: COMMENT_STATUS.DELETED, updated_at: new Date() },
    })
  }
}
