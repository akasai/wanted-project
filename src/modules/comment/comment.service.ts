import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { COMMENT_STATUS, POST_STATUS } from '../../common/enums'
import { PrismaService } from '../../common/prisma/prisma.service'
import { Crypto } from '../../utils/crypto'
import { post as Post, comments as Comments } from '.prisma/client'

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {
  }

  async createComment(postId: number, content: string, author: string, password: string, commentId?: number) {
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
}
