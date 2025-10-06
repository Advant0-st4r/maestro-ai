import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../app/api/auth/[...nextauth]/route'
import { auditLogger } from '@/lib/audit'
import { accessControlService } from '@/lib/access-control'
import { encryptionService } from '@/lib/encryption'

export interface SecurityConfig {
  requireAuth: boolean
  requirePermissions?: {
    resourceType: string
    permission: string
  }
  rateLimit?: {
    maxRequests: number
    windowMs: number
  }
  encryption?: {
    required: boolean
    fields: string[]
  }
  audit?: {
    enabled: boolean
    logLevel: 'minimal' | 'standard' | 'detailed'
  }
}

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export class SecurityMiddleware {
  private static instance: SecurityMiddleware

  public static getInstance(): SecurityMiddleware {
    if (!SecurityMiddleware.instance) {
      SecurityMiddleware.instance = new SecurityMiddleware()
    }
    return SecurityMiddleware.instance
  }

  // Main security middleware
  public async applySecurity(
    request: NextRequest,
    config: SecurityConfig,
    handler: (request: NextRequest) => Promise<Response>
  ): Promise<Response> {
    try {
      // 1. Authentication check
      if (config.requireAuth) {
        const authResult = await this.checkAuthentication(request)
        if (!authResult.authenticated) {
          return new Response('Unauthorized', { status: 401 })
        }
      }

      // 2. Rate limiting
      if (config.rateLimit) {
        const rateLimitResult = await this.checkRateLimit(request, config.rateLimit)
        if (!rateLimitResult.allowed) {
          return new Response('Too Many Requests', { status: 429 })
        }
      }

      // 3. Permission check
      if (config.requirePermissions) {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
          return new Response('Unauthorized', { status: 401 })
        }

        const hasPermission = await accessControlService.checkPermission(
          session.user.id,
          session.user.organizationId || 'unknown',
          config.requirePermissions.resourceType as any,
          config.requirePermissions.permission as any
        )

        if (!hasPermission.hasPermission) {
          return new Response('Forbidden', { status: 403 })
        }
      }

      // 4. Execute handler
      const response = await handler(request)

      // 5. Audit logging
      if (config.audit?.enabled) {
        await this.logRequest(request, response, config.audit.logLevel)
      }

      return response
    } catch (error) {
      console.error('Security middleware error:', error)
      
      // Log security event
      await auditLogger.logSecurityEvent(
        'system',
        'unknown',
        'suspicious_activity',
        request,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      )

      return new Response('Internal Server Error', { status: 500 })
    }
  }

  // Check authentication
  private async checkAuthentication(request: NextRequest): Promise<{ authenticated: boolean; userId?: string }> {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user) {
        return { authenticated: false }
      }

      // Check if user is active
      if (!session.user.isActive) {
        return { authenticated: false }
      }

      return { authenticated: true, userId: session.user.id }
    } catch (error) {
      console.error('Authentication check failed:', error)
      return { authenticated: false }
    }
  }

  // Check rate limiting
  private async checkRateLimit(
    request: NextRequest,
    config: { maxRequests: number; windowMs: number }
  ): Promise<{ allowed: boolean; remaining?: number }> {
    try {
      const clientId = this.getClientId(request)
      const now = Date.now()
      const windowStart = now - config.windowMs

      // Clean up expired entries
      for (const [key, value] of rateLimitStore.entries()) {
        if (value.resetTime < now) {
          rateLimitStore.delete(key)
        }
      }

      // Get current rate limit data
      const current = rateLimitStore.get(clientId)
      
      if (!current || current.resetTime < now) {
        // First request or window expired
        rateLimitStore.set(clientId, {
          count: 1,
          resetTime: now + config.windowMs
        })
        return { allowed: true, remaining: config.maxRequests - 1 }
      }

      if (current.count >= config.maxRequests) {
        return { allowed: false, remaining: 0 }
      }

      // Increment counter
      current.count++
      rateLimitStore.set(clientId, current)

      return { allowed: true, remaining: config.maxRequests - current.count }
    } catch (error) {
      console.error('Rate limit check failed:', error)
      return { allowed: true } // Fail open
    }
  }

  // Get client identifier for rate limiting
  private getClientId(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0]?.trim() || realIP || request.ip || 'unknown'
    
    // In production, you might want to use user ID for authenticated requests
    const session = getServerSession(authOptions)
    if (session?.user) {
      return `user:${session.user.id}`
    }
    
    return `ip:${ip}`
  }

  // Log request for audit
  private async logRequest(
    request: NextRequest,
    response: Response,
    logLevel: 'minimal' | 'standard' | 'detailed'
  ): Promise<void> {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user) {
        return
      }

      const auditData: any = {
        method: request.method,
        url: request.nextUrl.pathname,
        statusCode: response.status,
        userAgent: request.headers.get('user-agent'),
        ipAddress: this.getClientId(request),
        timestamp: new Date().toISOString()
      }

      if (logLevel === 'standard' || logLevel === 'detailed') {
        auditData.queryParams = Object.fromEntries(request.nextUrl.searchParams)
        auditData.headers = Object.fromEntries(request.headers.entries())
      }

      if (logLevel === 'detailed') {
        // In production, you might want to log request body for certain endpoints
        auditData.detailed = true
      }

      await auditLogger.logApiAccess(
        session.user.id,
        session.user.organizationId || 'unknown',
        request.nextUrl.pathname,
        request.method,
        response.status,
        0, // Response time would be calculated elsewhere
        request,
        auditData
      )
    } catch (error) {
      console.error('Audit logging failed:', error)
    }
  }

  // Validate request data
  public validateRequestData(data: any, schema: any): { valid: boolean; errors?: string[] } {
    try {
      // In production, use a proper validation library like Zod
      // This is a simplified example
      const errors: string[] = []

      if (schema.required) {
        for (const field of schema.required) {
          if (!data[field]) {
            errors.push(`${field} is required`)
          }
        }
      }

      if (schema.stringFields) {
        for (const field of schema.stringFields) {
          if (data[field] && typeof data[field] !== 'string') {
            errors.push(`${field} must be a string`)
          }
        }
      }

      if (schema.numberFields) {
        for (const field of schema.numberFields) {
          if (data[field] && typeof data[field] !== 'number') {
            errors.push(`${field} must be a number`)
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
      }
    } catch (error) {
      console.error('Request validation failed:', error)
      return { valid: false, errors: ['Validation failed'] }
    }
  }

  // Sanitize input data
  public sanitizeInput(data: any): any {
    try {
      const sanitized = { ...data }

      // Remove potentially dangerous characters
      for (const key in sanitized) {
        if (typeof sanitized[key] === 'string') {
          sanitized[key] = sanitized[key]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .trim()
        }
      }

      return sanitized
    } catch (error) {
      console.error('Input sanitization failed:', error)
      return data
    }
  }

  // Check for suspicious activity
  public async checkSuspiciousActivity(request: NextRequest): Promise<boolean> {
    try {
      const userAgent = request.headers.get('user-agent') || ''
      const ip = this.getClientId(request)

      // Check for suspicious patterns
      const suspiciousPatterns = [
        /sqlmap/i,
        /nikto/i,
        /nmap/i,
        /masscan/i,
        /bot/i,
        /crawler/i,
        /spider/i
      ]

      const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent))

      if (isSuspicious) {
        await auditLogger.logSecurityEvent(
          'system',
          'unknown',
          'suspicious_activity',
          request,
          { userAgent, ip, reason: 'Suspicious user agent' }
        )
      }

      return isSuspicious
    } catch (error) {
      console.error('Suspicious activity check failed:', error)
      return false
    }
  }
}

// Create singleton instance
export const securityMiddleware = SecurityMiddleware.getInstance()

// Convenience functions for common security configurations
export const requireAuth = (handler: (request: NextRequest) => Promise<Response>) => {
  return securityMiddleware.applySecurity(
    new NextRequest(''),
    { requireAuth: true },
    handler
  )
}

export const requirePermission = (
  resourceType: string,
  permission: string,
  handler: (request: NextRequest) => Promise<Response>
) => {
  return securityMiddleware.applySecurity(
    new NextRequest(''),
    {
      requireAuth: true,
      requirePermissions: { resourceType, permission }
    },
    handler
  )
}

export const withRateLimit = (
  maxRequests: number,
  windowMs: number,
  handler: (request: NextRequest) => Promise<Response>
) => {
  return securityMiddleware.applySecurity(
    new NextRequest(''),
    {
      requireAuth: true,
      rateLimit: { maxRequests, windowMs }
    },
    handler
  )
}

export const withAudit = (
  logLevel: 'minimal' | 'standard' | 'detailed',
  handler: (request: NextRequest) => Promise<Response>
) => {
  return securityMiddleware.applySecurity(
    new NextRequest(''),
    {
      requireAuth: true,
      audit: { enabled: true, logLevel }
    },
    handler
  )
}
