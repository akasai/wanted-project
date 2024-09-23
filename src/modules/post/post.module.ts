import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { CreatePostHandler } from './handlers/create-post.handler'
import { PostController } from './post.controller'
import { PostService } from './post.service'

@Module({
  imports: [CqrsModule],
  controllers: [PostController],
  providers: [PostService, CreatePostHandler],
})
export class PostModule {}
