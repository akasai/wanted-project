import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { CreatePostHandler } from './handlers/create-post.handler'
import { DeletePostHandler } from './handlers/delete-post.handler'
import { EditPostHandler } from './handlers/edit-post.handler'
import { GetPostListHandler } from './handlers/get-post-list.handler'
import { GetPostHandler } from './handlers/get-post.handler'
import { PostController } from './post.controller'
import { PostService } from './post.service'

const handler = [CreatePostHandler, GetPostHandler, GetPostListHandler, EditPostHandler, DeletePostHandler]

@Module({
  imports: [CqrsModule],
  controllers: [PostController],
  providers: [PostService, ...handler],
})
export class PostModule {}
