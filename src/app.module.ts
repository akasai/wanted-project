import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { PrismaModule } from './common/prisma/prisma.module'
import { CommentModule } from './modules/comment/comment.module'
import { PostModule } from './modules/post/post.module'

@Module({
  imports: [PrismaModule, PostModule, CommentModule],
  controllers: [AppController],
})
export class AppModule {}
