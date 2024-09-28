import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { CommentHandlers } from './commands/handlers'
import { CommentService } from './comment.service'
import { QueryHandlers } from './queries/handlers'

@Module({
  imports: [CqrsModule],
  providers: [CommentService, ...CommentHandlers, ...QueryHandlers],
  exports: [CommentService, ...CommentHandlers, ...QueryHandlers],
})
export class CommentModule {
}
