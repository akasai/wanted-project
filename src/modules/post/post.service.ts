import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { Crypto } from '../../utils/crypto'

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async createPost(
    title: string,
    content: string,
    author: string,
    password: string,
  ) {
    if (!(title && content && author && password)) {
      throw new BadRequestException('잘못된 요청입니다.')
    }
    return this.prisma.post.create({
      data: {
        title,
        content,
        author_name: author,
        password_hash: Crypto.plainToSHA256(password),
      },
    })
  }
}
