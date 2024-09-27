import { comments as Comments } from '.prisma/client'

export interface ICommentModel {
  id: number
  content: string
  author: string
  created_at: Date
  updated_at: Date
  reply: Array<ICommentModel>
}

export type ExtendedComment = Comments & { reply: Array<Comments> }

export type NestedComment = Array<ExtendedComment>
