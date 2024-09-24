import { Crypto } from '../../../src/utils/crypto'
import { BCRYPT_PATTERN } from '../../lib/constants'

describe('Crypto', () => {
  const plainPassword: string = 'password'
  it('plainToSHA256', async () => {
    const encrypted: string = await Crypto.plainToHash(plainPassword)

    expect(encrypted).toBeDefined() // 해싱된 값이 존재하는지 확인
    expect(BCRYPT_PATTERN.test(encrypted)).toBe(true)
  })

  it('isMatchedEncrypted', async () => {
    const encrypted: string = await Crypto.plainToHash(plainPassword)
    const result = await Crypto.isMatchedEncrypted(plainPassword, encrypted)
    expect(result).toBe(true)
  })
})
