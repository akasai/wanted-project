import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import * as express from 'express'

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<express.Response>()
    const request = ctx.getRequest<express.Request>()
    const message = this.getMsg(exception)
    const statusCode = this.getStatusCode(exception)

    // TODO: 3rdParty툴(kibana)에 에러 메트릭 전송
    // sendTo3rdParty()
    console.error(statusCode, message)
    console.error(request)
    response.status(statusCode).json(exception.response)
  }

  private getMsg(error: Error) {
    const httpException = error as HttpException

    if (!!httpException.getResponse) {
      const exceptionResponse = httpException.getResponse()
      if (typeof exceptionResponse === 'string') {
        return exceptionResponse
      } else if (typeof exceptionResponse === 'object') {
        return (exceptionResponse as any).message ? (exceptionResponse as any) : ''
      }
    }

    return error.message
  }

  private getStatusCode(error: Error) {
    const httpException = error as HttpException
    if (!!httpException.getStatus) {
      return httpException.getStatus()
    }
    if (!!httpException.getResponse) {
      const res = httpException.getResponse()
      if (typeof res === 'object') {
        return parseInt((res as any).code) || HttpStatus.INTERNAL_SERVER_ERROR
      }
    }
    return HttpStatus.INTERNAL_SERVER_ERROR
  }
}
