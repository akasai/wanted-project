import { comments as Comments, post as Post } from '@prisma/client'
import { COMMENT_STATUS, POST_STATUS } from '../../src/common/enums'

export default class Mocker {
  static get updatedAt() {
    return new Date()
  }

  static get post(): Post {
    return {
      id: 1,
      title: '제목',
      content: '내용',
      author_name: '작성자',
      password_hash: 'password_hash',
      status: POST_STATUS.ACTIVE,
      created_at: new Date(),
      updated_at: null,
    }
  }

  static get updatedPost(): Post {
    const post = Mocker.post
    post.title = '제목 변경'
    post.content = '내용 변경'
    post.updated_at = Mocker.updatedAt
    return post
  }

  static get deletedPost() {
    const post = Mocker.post
    post.status = POST_STATUS.DELETED
    post.updated_at = Mocker.updatedAt
    return post
  }

  static get postList(): Array<Post> {
    const post = (id: number) => ({
      id,
      title: '제목',
      content: '내용',
      author_name: '작성자',
      password_hash: 'password_hash',
      status: POST_STATUS.ACTIVE,
      created_at: new Date(),
      updated_at: null,
    })

    return Array.from({ length: 10 }, (_, idx) => post(idx + 1))
  }

  static get postListDesc(): Array<Post> {
    return Mocker.postList.reverse()
  }

  static get comment(): Comments {
    return {
      id: 1,
      post_id: 1,
      parent_id: null,
      content: '댓글 내용',
      author_name: '댓글 작성자',
      password_hash: 'password_hash',
      status: COMMENT_STATUS.ACTIVE,
      created_at: new Date(),
      updated_at: null,
    }
  }

  static get childComment(): Comments {
    return {
      id: 2,
      post_id: 1,
      parent_id: 1,
      content: '대댓글 내용',
      author_name: '대댓글 작성자',
      password_hash: 'password_hash',
      status: COMMENT_STATUS.ACTIVE,
      created_at: new Date(),
      updated_at: null,
    }
  }

  static get allCommentList(): Array<Comments> {
    const comment = (id: number) => ({
      id,
      post_id: 1,
      parent_id: null,
      content: '댓글 내용',
      author_name: '댓글 작성자',
      password_hash: 'password_hash',
      status: COMMENT_STATUS.ACTIVE,
      created_at: new Date(),
      updated_at: null,
    })

    return Array.from({ length: 10 }, (_, idx) => comment(idx + 1)).reverse()
  }

  static get childCommentList() {
    const comment = (id: number, parentId: number) => ({
      id,
      post_id: 1,
      parent_id: parentId,
      content: '댓글 내용',
      author_name: '댓글 작성자',
      password_hash: 'password_hash',
      status: COMMENT_STATUS.ACTIVE,
      created_at: new Date(),
      updated_at: null,
    })
    return Array.from({ length: 10 }, (_, idx) => comment(idx + 1, Math.floor(idx / 2) + 1)).reverse()
  }

  static get nestedCommentList() {
    const comment = (id: number, parentId?: number) => ({
      id,
      post_id: 1,
      parent_id: parentId || null,
      content: '댓글 내용',
      author_name: '댓글 작성자',
      password_hash: 'password_hash',
      status: COMMENT_STATUS.ACTIVE,
      created_at: new Date(),
      updated_at: null,
      reply: [],
    })

    return Array.from({ length: 10 }, (_, idx) => {
      const c = comment(idx + 1)
      c.reply.push(comment(10 + idx + 1, idx + 1))
      return c
    })
  }

  static get deletedComment(): Comments {
    const comment = Mocker.comment
    comment.status = COMMENT_STATUS.DELETED
    comment.updated_at = Mocker.updatedAt
    return comment
  }

  static get commentCount(): Map<number, number> {
    return new Map([
      [1, 4],
      [2, 2],
    ])
  }
}
