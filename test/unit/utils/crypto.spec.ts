import * as crypto from 'crypto'
import { Crypto } from '../../../src/utils/crypto'

describe('Crypto', () => {
  const plainPassword: string = 'password'
  const base64Pattern = /^[-A-Za-z0-9+/]*={0,3}$/

  it('plainToSHA256', () => {
    const encrypted: string = Crypto.plainToSHA256(plainPassword)
    const expected = crypto
      .createHash('sha256')
      .update(plainPassword)
      .digest('base64')

    expect(encrypted).toEqual(expected)
    expect(base64Pattern.test(expected)).toBe(true)
  })

  it('isMatchedEncrypted', () => {
    const encrypted: string = Crypto.plainToSHA256(plainPassword)
    const result = Crypto.isMatchedEncrypted(plainPassword, encrypted)
    expect(result).toBe(true)
  })
})
