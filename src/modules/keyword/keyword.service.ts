import { Inject, Injectable } from '@nestjs/common'
import { AlarmService } from '../../common/alarm/alarm.service'

@Injectable()
export class KeywordService {
  constructor(
    @Inject('KEYWORD_CACHE') private readonly keywordCache: Map<string, string[]>,
    private readonly alarmService: AlarmService,
  ) {}

  checkKeywordIncluded(content: string, id: number, template: string) {
    const userList = []
    for (const [keyword, users] of this.keywordCache) {
      if (content.includes(keyword)) {
        userList.push(...users)
      }
    }
    if (userList.length) {
      this.alarmService.sendAlarm([...new Set(userList)], `${template}`)
    }
  }
}
