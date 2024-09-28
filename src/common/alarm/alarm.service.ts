import { Injectable } from '@nestjs/common'

@Injectable()
export class AlarmService {
  sendAlarm(userList: string[], msg: string) {
    // TODO: Alarm전송 로직
    this.sleep(2000).then(() => {
      console.log(`[${userList.join(', ')}]: ${msg} - 2000ms delayed`)
    })
  }

  private sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }
}
