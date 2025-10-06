import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../app/api/auth/[...nextauth]/route'

export interface AuditLogEntry {
  action: string
  resourceType: string
  resourceId?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  sessionId?: string
}

export class AuditLogger {
  private static instance: AuditLogger
  private supabase: any

  constructor() {
    // Initialize Supabase client
    this.supabase = null // Would be initialized with proper client
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  // Log user authentication events
  public async logAuthEvent(
    userId: string,
    organizationId: string,
    action: 'login' | 'logout' | 'register' | 'password_reset',
    request: NextRequest,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action,
      resourceType: 'user',
      resourceId: userId,
      metadata: {
        ...metadata,
        organizationId,
        timestamp: new Date().toISOString()
      },
      ipAddress: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined,
      sessionId: this.getSessionId(request)
    })
  }

  // Log data access events
  public async logDataAccess(
    userId: string,
    organizationId: string,
    resourceType: string,
    resourceId: string,
    action: 'view' | 'create' | 'update' | 'delete' | 'export',
    request: NextRequest,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action,
      resourceType,
      resourceId,
      metadata: {
        ...metadata,
        organizationId,
        userId,
        timestamp: new Date().toISOString()
      },
      ipAddress: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined,
      sessionId: this.getSessionId(request)
    })
  }

  // Log file operations
  public async logFileOperation(
    userId: string,
    organizationId: string,
    action: 'upload' | 'download' | 'delete' | 'encrypt' | 'decrypt',
    fileName: string,
    fileSize: number,
    fileType: string,
    request: NextRequest,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action,
      resourceType: 'file',
      metadata: {
        ...metadata,
        organizationId,
        userId,
        fileName,
        fileSize,
        fileType,
        timestamp: new Date().toISOString()
      },
      ipAddress: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined,
      sessionId: this.getSessionId(request)
    })
  }

  // Log security events
  public async logSecurityEvent(
    userId: string,
    organizationId: string,
    event: 'unauthorized_access' | 'suspicious_activity' | 'data_breach_attempt' | 'encryption_key_rotation',
    request: NextRequest,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action: event,
      resourceType: 'security',
      metadata: {
        ...metadata,
        organizationId,
        userId,
        severity: this.getSeverityLevel(event),
        timestamp: new Date().toISOString()
      },
      ipAddress: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined,
      sessionId: this.getSessionId(request)
    })
  }

  // Log API access
  public async logApiAccess(
    userId: string,
    organizationId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    request: NextRequest,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action: 'api_access',
      resourceType: 'api',
      metadata: {
        ...metadata,
        organizationId,
        userId,
        endpoint,
        method,
        statusCode,
        responseTime,
        timestamp: new Date().toISOString()
      },
      ipAddress: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || undefined,
      sessionId: this.getSessionId(request)
    })
  }

  // Log data retention events
  public async logDataRetention(
    organizationId: string,
    resourceType: string,
    resourceId: string,
    action: 'scheduled_deletion' | 'deleted' | 'retention_extended',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action,
      resourceType,
      resourceId,
      metadata: {
        ...metadata,
        organizationId,
        timestamp: new Date().toISOString()
      }
    })
  }

  // Core logging method
  private async log(entry: AuditLogEntry): Promise<void> {
    try {
      // In production, this would write to the audit_logs table
      console.log('AUDIT LOG:', {
        ...entry,
        timestamp: new Date().toISOString()
      })

      // Example of what would be stored in database:
      /*
      await this.supabase
        .from('audit_logs')
        .insert({
          organization_id: entry.metadata?.organizationId,
          user_id: entry.metadata?.userId,
          action: entry.action,
          resource_type: entry.resourceType,
          resource_id: entry.resourceId,
          ip_address: entry.ipAddress,
          user_agent: entry.userAgent,
          session_id: entry.sessionId,
          metadata: entry.metadata
        })
      */
    } catch (error) {
      console.error('Failed to write audit log:', error)
      // In production, this should not fail silently
      // Consider using a separate audit service or queue
    }
  }

  // Get client IP address
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    return request.ip || 'unknown'
  }

  // Get session ID
  private getSessionId(request: NextRequest): string | undefined {
    return request.headers.get('x-session-id') || undefined
  }

  // Get severity level for security events
  private getSeverityLevel(event: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (event) {
      case 'unauthorized_access':
      case 'data_breach_attempt':
        return 'critical'
      case 'suspicious_activity':
        return 'high'
      case 'encryption_key_rotation':
        return 'medium'
      default:
        return 'low'
    }
  }

  // Query audit logs (admin only)
  public async queryAuditLogs(
    organizationId: string,
    filters: {
      userId?: string
      action?: string
      resourceType?: string
      startDate?: Date
      endDate?: Date
      limit?: number
      offset?: number
    }
  ): Promise<any[]> {
    try {
      // In production, this would query the audit_logs table
      console.log('Querying audit logs for organization:', organizationId, 'filters:', filters)
      return []
    } catch (error) {
      console.error('Failed to query audit logs:', error)
      return []
    }
  }

  // Get audit statistics
  public async getAuditStats(organizationId: string, days: number = 30): Promise<any> {
    try {
      // In production, this would aggregate audit log data
      console.log('Getting audit stats for organization:', organizationId, 'days:', days)
      return {
        totalEvents: 0,
        uniqueUsers: 0,
        topActions: [],
        securityEvents: 0,
        dataAccessEvents: 0
      }
    } catch (error) {
      console.error('Failed to get audit stats:', error)
      return {}
    }
  }
}

// Create singleton instance
export const auditLogger = AuditLogger.getInstance()

// Middleware for automatic audit logging
export async function auditMiddleware(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<Response>
): Promise<Response> {
  const startTime = Date.now()
  
  try {
    const response = await handler(request)
    const responseTime = Date.now() - startTime
    
    // Log API access
    const session = await getServerSession(authOptions)
    if (session?.user) {
      await auditLogger.logApiAccess(
        session.user.id,
        session.user.organizationId || 'unknown',
        request.nextUrl.pathname,
        request.method,
        response.status,
        responseTime,
        request
      )
    }
    
    return response
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    // Log error
    const session = await getServerSession(authOptions)
    if (session?.user) {
      await auditLogger.logSecurityEvent(
        session.user.id,
        session.user.organizationId || 'unknown',
        'suspicious_activity',
        request,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      )
    }
    
    throw error
  }
}

// Utility functions for common audit scenarios
export const logUserLogin = async (userId: string, organizationId: string, request: NextRequest) => {
  await auditLogger.logAuthEvent(userId, organizationId, 'login', request)
}

export const logUserLogout = async (userId: string, organizationId: string, request: NextRequest) => {
  await auditLogger.logAuthEvent(userId, organizationId, 'logout', request)
}

export const logDataView = async (userId: string, organizationId: string, resourceType: string, resourceId: string, request: NextRequest) => {
  await auditLogger.logDataAccess(userId, organizationId, resourceType, resourceId, 'view', request)
}

export const logDataUpdate = async (userId: string, organizationId: string, resourceType: string, resourceId: string, request: NextRequest) => {
  await auditLogger.logDataAccess(userId, organizationId, resourceType, resourceId, 'update', request)
}

export const logFileUpload = async (userId: string, organizationId: string, fileName: string, fileSize: number, fileType: string, request: NextRequest) => {
  await auditLogger.logFileOperation(userId, organizationId, 'upload', fileName, fileSize, fileType, request)
}

export const logFileDownload = async (userId: string, organizationId: string, fileName: string, fileSize: number, fileType: string, request: NextRequest) => {
  await auditLogger.logFileOperation(userId, organizationId, 'download', fileName, fileSize, fileType, request)
}
