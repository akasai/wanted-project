import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { KeywordService } from '../../keyword/keyword.service'
import { KeywordEvent } from '../events/keyword.event'

@EventsHandler(KeywordEvent)
export class KeywordEventHandler implements IEventHandler<KeywordEvent> {
  constructor(
    private keywordService: KeywordService,
  ) {
  }

  handle(event: KeywordEvent) {
    const { type, content, postId } = event
    switch (type) {
      case 'post':
        this.keywordService.checkKeywordIncluded(content, postId, '키워드가 포함된 게시물이 등록되었습니다.')
        break
      case 'comment':
        this.keywordService.checkKeywordIncluded(content, postId, '키워드가 포함된 댓글이 등록되었습니다.')
        break
    }
  }
}
