import { Faker, ko } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { exit } from 'process'
import { Crypto } from '../../src/utils/crypto'

interface TableMeta {
  Tables_in_test_db: string
}

class Docker {
  private readonly LIMIT: number = 300
  private prisma: PrismaClient
  private faker: Faker

  constructor() {
    this.prisma = new PrismaClient({ datasourceUrl: 'mysql://test_user:test1234@localhost:23306/test_db' })
    this.faker = new Faker({ locale: [ko] })
  }

  async run() {
    let count = 1
    while (true) {
      try {
        await this.prisma.$connect()
        console.info(`✔ Database connection(${count}s) established`)
        break
      } catch (e) {
        if (count > this.LIMIT / 2) console.log('An unexpected error occurred:', e)
      }
      if (count % 3 === 0) console.info(`${count}s...`)
      if (++count >= this.LIMIT) break
      await this.delay(1000)
    }

    const tables = await this.prisma.$queryRaw<Array<TableMeta>>`SHOW TABLES`
    if (tables.length) {
      await this.migrationData()

      for (const { Tables_in_test_db: tableName } of tables) {
        const countResult = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM ${tableName}`)
        console.log(`✔ ${tableName}: ${countResult[0].count}`)
      }
    }

    await this.prisma.$disconnect()
  }

  async migrationData() {
    const POST_CNT = 25
    const COMMENT_CNT = 50
    const KEYWORD_CNT = 50
    const WORD_CNT = 15

    const posts = []
    for (let i = 1; i <= POST_CNT; i++) {
      const d = {
        title: this.faker.lorem.sentence(),
        content: this.faker.lorem.text(),
        author_name: this.faker.internet.displayName(),
        password_hash: await Crypto.plainToHash('password'),
      }
      posts.push(d)
    }
    console.log(`\t - 1. Migrate data: Post(${posts.length})`)
    await this.prisma.post.createMany({ data: posts })

    const comments = []
    for (let i = 1; i <= COMMENT_CNT; i++) {
      const c = {
        post_id: i % POST_CNT + 1,
        content: this.faker.lorem.text(),
        author_name: this.faker.internet.displayName(),
        password_hash: await Crypto.plainToHash('password'),
      }
      comments.push(c)
    }

    let j = 1
    const reply = []
    for (const comment of comments) {
      const c = {
        post_id: comment.post_id,
        parent_id: j++,
        content: this.faker.lorem.text(),
        author_name: this.faker.internet.displayName(),
        password_hash: await Crypto.plainToHash('password'),
      }
      reply.push(c)
    }

    console.log(`\t - 2. Migrate data: Comment(${[...comments, ...reply].length})`)
    await this.prisma.comments.createMany({ data: [...comments, ...reply] })

    const keywords = []
    const words = Array.from({ length: WORD_CNT }, () => this.faker.lorem.words(1))
    for (let i = 1; i <= KEYWORD_CNT; i++) {
      const k = {
        author_name: this.faker.internet.displayName(),
        keyword: words[Math.floor(Math.random() * WORD_CNT)]
      }

      keywords.push(k)
    }

    console.log(`\t - 3. Migrate data: Keyword(${keywords.length})`)
    await this.prisma.keyword.createMany({ data: keywords })
  }

  private async delay(timeout: number) {
    return new Promise((resolve) => setTimeout(resolve, timeout))
  }
}

const docker = new Docker()
docker.run().then(() => {
  console.info('MySQL Data migration completed.')
  exit(0)
}).catch((e) => {
  console.info('Migration failed1', e)
  exit(1)
})
