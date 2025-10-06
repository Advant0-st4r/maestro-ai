import crypto from 'crypto'

// Encryption configuration
const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32 // 256 bits
const IV_LENGTH = 16 // 128 bits
const TAG_LENGTH = 16 // 128 bits

interface EncryptionResult {
  encrypted: string
  iv: string
  tag: string
  keyId: string
}

interface DecryptionResult {
  decrypted: string
  success: boolean
}

class EncryptionService {
  private masterKey: string

  constructor() {
    this.masterKey = process.env.MASTER_ENCRYPTION_KEY || this.generateMasterKey()
  }

  private generateMasterKey(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  private generateDataKey(): Buffer {
    return crypto.randomBytes(KEY_LENGTH)
  }

  private encryptWithKey(data: string, key: Buffer): EncryptionResult {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipher(ALGORITHM, key)
    cipher.setAAD(Buffer.from('meeting-maestro', 'utf8'))
    
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      keyId: crypto.randomUUID()
    }
  }

  private decryptWithKey(encryptedData: EncryptionResult, key: Buffer): DecryptionResult {
    try {
      const decipher = crypto.createDecipher(ALGORITHM, key)
      decipher.setAAD(Buffer.from('meeting-maestro', 'utf8'))
      decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'))
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return { decrypted, success: true }
    } catch (error) {
      console.error('Decryption failed:', error)
      return { decrypted: '', success: false }
    }
  }

  // Encrypt sensitive data
  public encryptData(data: string, organizationId: string): EncryptionResult {
    const dataKey = this.generateDataKey()
    const encryptedKey = this.encryptKey(dataKey, organizationId)
    
    // Store encrypted key in database (this would be done in a separate service)
    this.storeEncryptedKey(encryptedKey, organizationId)
    
    return this.encryptWithKey(data, dataKey)
  }

  // Decrypt sensitive data
  public decryptData(encryptedData: EncryptionResult, organizationId: string): DecryptionResult {
    const dataKey = this.retrieveAndDecryptKey(encryptedData.keyId, organizationId)
    if (!dataKey) {
      return { decrypted: '', success: false }
    }
    
    return this.decryptWithKey(encryptedData, dataKey)
  }

  // Encrypt file content
  public encryptFile(fileBuffer: Buffer, organizationId: string): EncryptionResult {
    const dataKey = this.generateDataKey()
    const encryptedKey = this.encryptKey(dataKey, organizationId)
    
    this.storeEncryptedKey(encryptedKey, organizationId)
    
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipher(ALGORITHM, dataKey)
    cipher.setAAD(Buffer.from('meeting-maestro-file', 'utf8'))
    
    let encrypted = cipher.update(fileBuffer)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    
    const tag = cipher.getAuthTag()
    
    return {
      encrypted: encrypted.toString('base64'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      keyId: crypto.randomUUID()
    }
  }

  // Decrypt file content
  public decryptFile(encryptedData: EncryptionResult, organizationId: string): Buffer | null {
    const dataKey = this.retrieveAndDecryptKey(encryptedData.keyId, organizationId)
    if (!dataKey) {
      return null
    }
    
    try {
      const decipher = crypto.createDecipher(ALGORITHM, dataKey)
      decipher.setAAD(Buffer.from('meeting-maestro-file', 'utf8'))
      decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'))
      
      const encryptedBuffer = Buffer.from(encryptedData.encrypted, 'base64')
      let decrypted = decipher.update(encryptedBuffer)
      decrypted = Buffer.concat([decrypted, decipher.final()])
      
      return decrypted
    } catch (error) {
      console.error('File decryption failed:', error)
      return null
    }
  }

  // Hash data for integrity verification
  public hashData(data: string | Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  // Verify data integrity
  public verifyIntegrity(data: string | Buffer, hash: string): boolean {
    const computedHash = this.hashData(data)
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, 'hex'),
      Buffer.from(hash, 'hex')
    )
  }

  // Encrypt encryption key with master key
  private encryptKey(dataKey: Buffer, organizationId: string): string {
    const keyCipher = crypto.createCipher(ALGORITHM, this.masterKey)
    keyCipher.setAAD(Buffer.from(organizationId, 'utf8'))
    
    let encrypted = keyCipher.update(dataKey)
    encrypted = Buffer.concat([encrypted, keyCipher.final()])
    
    const tag = keyCipher.getAuthTag()
    return Buffer.concat([encrypted, tag]).toString('base64')
  }

  // Decrypt encryption key with master key
  private decryptKey(encryptedKey: string, organizationId: string): Buffer | null {
    try {
      const keyBuffer = Buffer.from(encryptedKey, 'base64')
      const encrypted = keyBuffer.slice(0, -TAG_LENGTH)
      const tag = keyBuffer.slice(-TAG_LENGTH)
      
      const keyDecipher = crypto.createDecipher(ALGORITHM, this.masterKey)
      keyDecipher.setAAD(Buffer.from(organizationId, 'utf8'))
      keyDecipher.setAuthTag(tag)
      
      let decrypted = keyDecipher.update(encrypted)
      decrypted = Buffer.concat([decrypted, keyDecipher.final()])
      
      return decrypted
    } catch (error) {
      console.error('Key decryption failed:', error)
      return null
    }
  }

  // Store encrypted key (would integrate with database)
  private storeEncryptedKey(encryptedKey: string, organizationId: string): void {
    // This would store the encrypted key in the encryption_keys table
    console.log('Storing encrypted key for organization:', organizationId)
  }

  // Retrieve and decrypt key (would integrate with database)
  private retrieveAndDecryptKey(keyId: string, organizationId: string): Buffer | null {
    // This would retrieve the encrypted key from the encryption_keys table
    // For now, return null to indicate key not found
    console.log('Retrieving key for organization:', organizationId, 'keyId:', keyId)
    return null
  }

  // Generate secure random string
  public generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  // Generate secure password hash
  public hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    return `${salt}:${hash.toString('hex')}`
  }

  // Verify password
  public verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':')
    const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      verifyHash
    )
  }
}

// Create singleton instance
export const encryptionService = new EncryptionService()

// Utility functions for common encryption tasks
export const encryptSensitiveData = (data: string, organizationId: string): EncryptionResult => {
  return encryptionService.encryptData(data, organizationId)
}

export const decryptSensitiveData = (encryptedData: EncryptionResult, organizationId: string): DecryptionResult => {
  return encryptionService.decryptData(encryptedData, organizationId)
}

export const encryptFile = (fileBuffer: Buffer, organizationId: string): EncryptionResult => {
  return encryptionService.encryptFile(fileBuffer, organizationId)
}

export const decryptFile = (encryptedData: EncryptionResult, organizationId: string): Buffer | null => {
  return encryptionService.decryptFile(encryptedData, organizationId)
}

export const hashData = (data: string | Buffer): string => {
  return encryptionService.hashData(data)
}

export const verifyIntegrity = (data: string | Buffer, hash: string): boolean => {
  return encryptionService.verifyIntegrity(data, hash)
}
