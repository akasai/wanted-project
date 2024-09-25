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
    return this.checkDockerStatus()
  }

  async checkDockerStatus() {
    let count = 1
    while (true) {
      try {
        await this.prisma.$connect()
        console.info(`✔ Database connection(${count}) established`)

        const tables = await this.prisma.$queryRaw<Array<TableMeta>>`SHOW TABLES`

        if (tables.length) {
          await this.migrationData()

          for (const { Tables_in_test_db: tableName } of tables) {
            const countResult = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM ${tableName}`)
            console.log(`✔ ${tableName}: ${countResult[0].count}`)
          }
        }
        await this.prisma.$disconnect()
        break
      } catch (e) {
        if (count > this.LIMIT / 2) console.log('An unexpected error occurred:', e)
      }
      if (++count >= this.LIMIT) break
      await this.delay(500)
    }
  }

  async migrationData() {
    const data = []
    for (let i = 1; i <= 25; i++) {
      const d = {
        title: this.faker.lorem.sentence(),
        content: this.faker.lorem.text(),
        author_name: this.faker.internet.displayName(),
        password_hash: await Crypto.plainToHash((i + 1).toString()),
      }
      data.push(d)
    }
    await this.prisma.post.createMany({ data })
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
