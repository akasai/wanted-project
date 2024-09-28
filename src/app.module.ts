import { Global, Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { PrismaModule } from './common/prisma/prisma.module'
import { PrismaService } from './common/prisma/prisma.service'
import { PostModule } from './modules/post/post.module'

@Global()
@Module({
  imports: [PrismaModule, PostModule],
  controllers: [AppController],
  providers: [
    {
      provide: 'KEYWORD_CACHE',
      useFactory: async (prisma: PrismaService) => {
        console.log('Initializing keyword cache...')
        const keywords = await prisma.keyword.findMany({
          select: { keyword: true, author_name: true },
        })
        return keywords.reduce((cache, { keyword, author_name }) => {
          if (cache.has(keyword)) cache.get(keyword).push(author_name)
          else cache.set(keyword, [author_name])
          return cache
        }, new Map<string, string[]>())
      },
      inject: [PrismaService],
    },
  ],
  exports: ['KEYWORD_CACHE'],
})
export class AppModule {
}
