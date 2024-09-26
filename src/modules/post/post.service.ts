import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { post as Post } from '@prisma/client'
import { POST_STATUS } from '../../common/enums'
import { PrismaService } from '../../common/prisma/prisma.service'
import { Crypto } from '../../utils/crypto'
import { SearchFilter } from './models/post'

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(title: string, content: string, author: string, password: string) {
    if (!(title && content && author && password)) {
      throw new BadRequestException('잘못된 요청입니다.')
    }
    return this.prisma.post.create({
      data: {
        title,
        content,
        author_name: author,
        password_hash: await Crypto.plainToHash(password),
      },
    })
  }

  async getPostById(id: number): Promise<Post> {
    const post: Post = await this.prisma.post.findUnique({
      where: {
        id,
        status: POST_STATUS.ACTIVE,
      },
    })

    if (!post) {
      throw new NotFoundException('존재하지 않는 게시물입니다.')
    }

    return post
  }

  async getPostList(filter: SearchFilter, page: number = 1, size: number = 10): Promise<Post[]> {
    const where = { status: POST_STATUS.ACTIVE }

    if (filter.title) {
      where['title'] = { contains: filter.title }
    }
    if (filter.author) {
      where['author_name'] = { contains: filter.author }
    }

    const postList = await this.prisma.post.findMany({
      where,
      orderBy: { id: filter.order || 'desc' },
      skip: (page - 1) * size, // 건너뛸 게시물 수
      take: size, // 한 페이지에 표시할 게시물 수
    })

    return postList
  }

  async updatePost(id: number, author: string, password: string, editValue: Partial<Post>): Promise<Post> {
    if (Object.values(editValue).every((v) => !v)) {
      throw new BadRequestException('잘못된 요청입니다.')
    }

    const post = await this.prisma.post.findUnique({
      where: { id: id, author_name: author, status: POST_STATUS.ACTIVE },
    })
    if (!post) {
      throw new NotFoundException('게시글이 존재하지 않습니다.')
    }
    if (!(await Crypto.isMatchedEncrypted(password, post.password_hash))) {
      throw new BadRequestException('비밀번호가 틀렸습니다.')
    }

    const data: Partial<Post> = Object.entries(editValue).reduce(
      (obj, [key, val]) => {
        if (val) obj[key] = val
        return obj
      },
      { updated_at: new Date() },
    )

    const updated = await this.prisma.post.update({
      where: { id, author_name: author, status: POST_STATUS.ACTIVE },
      data,
    })
    return updated
  }

  async softDeletePost(id: number, author: string, password: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id: id, author_name: author, status: POST_STATUS.ACTIVE },
    })
    if (!post) {
      throw new NotFoundException('게시글이 존재하지 않습니다.')
    }
    if (!(await Crypto.isMatchedEncrypted(password, post.password_hash))) {
      throw new BadRequestException('비밀번호가 틀렸습니다.')
    }

    return this.prisma.post.update({
      where: { id, author_name: author, status: POST_STATUS.ACTIVE },
      data: { status: POST_STATUS.DELETED, updated_at: new Date() },
    })
  }
}
