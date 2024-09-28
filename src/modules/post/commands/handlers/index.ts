import { CreatePostHandler } from './create-post.handler'
import { DeletePostHandler } from './delete-post.handler'
import { EditPostHandler } from './edit-post.handler'

export * from './create-post.handler'
export * from './delete-post.handler'
export * from './edit-post.handler'

export const CommandHandlers = [CreatePostHandler, DeletePostHandler, EditPostHandler]
