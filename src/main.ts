import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { AllExceptionFilter } from './middlewares/all-exception.filter'

process.on('unhandledException', (reason: any) => {
  console.error('unhandledException', reason)
})

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  app.useGlobalFilters(new AllExceptionFilter())

  const config = new DocumentBuilder()
    .setTitle('Wanted Project API')
    .setDescription('Posts API Documentation')
    .setVersion('0.1')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/api', app, document)

  await app.listen(3000)
}

bootstrap()
