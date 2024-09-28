import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { CommentModule } from '../comment/comment.module'
import { KeywordModule } from '../keyword/keyword.module'
import { CommandHandlers } from './commands/handlers'
import { EventHandlers } from './events/handlers'
import { PostController } from './post.controller'
import { PostService } from './post.service'
import { QueryHandlers } from './queries/handlers'

@Module({
  imports: [CqrsModule, CommentModule, KeywordModule],
  controllers: [PostController],
  providers: [PostService, ...CommandHandlers, ...EventHandlers, ...QueryHandlers],
})
export class PostModule {}
