export type SearchType = 'title' | 'author'

export interface SearchFilter {
  title?: string
  author?: string
  order?: 'asc' | 'desc'
}

export interface IPostModel {
  id: number
  title: string
  content: string
  author: string
  created_at: Date
  updated_at: Date
  comment_count: number
}

export interface ISimplePostModel extends IPostModel {}

export interface IEditPostModel {
  title?: string
  content?: string
  updated_at: Date
}
