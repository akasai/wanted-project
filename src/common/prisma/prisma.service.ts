import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
    })
  }

  async onModuleInit(): Promise<any> {
    this.$on('query', (e: Prisma.QueryEvent) => {
      console.log(`[Prisma-query]: ${e.query}${e.params.length > 2 ? ' - ' + e.params : ''} - ${e.duration}ms`)
    })

    await this.$connect()
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect()
  }
}
