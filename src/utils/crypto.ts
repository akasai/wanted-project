import * as crypto from 'crypto'

export class Crypto {
  static plainToSHA256 = (plaintext: string) => {
    return crypto.createHash('sha256').update(plaintext).digest('base64')
  }
  static isMatchedEncrypted = (target: string, encrypted: string) => {
    return encrypted === Crypto.plainToSHA256(target)
  }
}
