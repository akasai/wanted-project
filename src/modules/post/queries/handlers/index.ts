import { GetPostListHandler } from './get-post-list.handler'
import { GetPostHandler } from './get-post.handler'

export * from './get-post.handler'
export * from './get-post-list.handler'

export const QueryHandlers = [GetPostHandler, GetPostListHandler]
