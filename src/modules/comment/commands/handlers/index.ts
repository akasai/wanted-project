import { CreateCommentHandler } from './create-comment.handler'
import { DeleteCommentHandler } from './delete-comment.handler'

export * from './create-comment.handler'
export * from './delete-comment.handler'

export const CommentHandlers = [CreateCommentHandler, DeleteCommentHandler]
