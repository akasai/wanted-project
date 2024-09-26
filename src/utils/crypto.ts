import * as bcrypt from 'bcryptjs'

export class Crypto {
  static plainToHash = async (plaintext: string) => {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(plaintext, salt)
  }
  static isMatchedEncrypted = async (plaintext: string, encrypted: string) => {
    return bcrypt.compare(plaintext, encrypted)
  }
}
