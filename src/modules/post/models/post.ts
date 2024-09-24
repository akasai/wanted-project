export interface SearchFilter {
  title?: string
  author?: string
  order?: 'asc' | 'desc'
}

export interface PostModel {
  id: number
  title: string
  content: string
  author: string
  created_at: Date
  updated_at: Date
}

export interface SimplePostModel extends PostModel {
}

export type SearchType = 'title' | 'author'
