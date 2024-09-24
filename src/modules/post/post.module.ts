import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { CreatePostHandler } from './handlers/create-post.handler'
import { GetPostListHandler } from './handlers/get-post-list.handler'
import { GetPostHandler } from './handlers/get-post.handler'
import { PostController } from './post.controller'
import { PostService } from './post.service'

const handler = [CreatePostHandler, GetPostHandler, GetPostListHandler]

@Module({
  imports: [CqrsModule],
  controllers: [PostController],
  providers: [PostService, ...handler],
})
export class PostModule {
}
