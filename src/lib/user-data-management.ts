import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../app/api/auth/[...nextauth]/route'
import { encryptionService } from './encryption'
import { auditLogger } from './audit'
import { accessControlService } from './access-control'
import { dataRetentionService } from './data-retention'

export interface UserDataExport {
  userId: string
  organizationId: string
  personalData: {
    profile: any
    preferences: any
    sessions: any[]
  }
  organizationData: {
    meetings: any[]
    actions: any[]
    analytics: any[]
    files: any[]
  }
  auditTrail: any[]
  exportDate: string
  format: 'json' | 'csv' | 'pdf'
}

export interface DataDeletionRequest {
  userId: string
  organizationId: string
  reason: string
  confirmationCode: string
  requestedBy: string
  requestedAt: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
}

export class UserDataManagementService {
  private static instance: UserDataManagementService
  private supabase: any

  constructor() {
    this.supabase = null // Would be initialized with proper client
  }

  public static getInstance(): UserDataManagementService {
    if (!UserDataManagementService.instance) {
      UserDataManagementService.instance = new UserDataManagementService()
    }
    return UserDataManagementService.instance
  }

  // Export all user data (GDPR compliance)
  public async exportUserData(
    userId: string,
    organizationId: string,
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<UserDataExport> {
    try {
      // Check permissions
      const hasPermission = await accessControlService.checkPermission(
        userId,
        organizationId,
        'user',
        'read'
      )

      if (!hasPermission.hasPermission) {
        throw new Error('Insufficient permissions to export data')
      }

      // Collect personal data
      const personalData = await this.collectPersonalData(userId, organizationId)
      
      // Collect organization data
      const organizationData = await this.collectOrganizationData(userId, organizationId)
      
      // Collect audit trail
      const auditTrail = await this.collectAuditTrail(userId, organizationId)

      const exportData: UserDataExport = {
        userId,
        organizationId,
        personalData,
        organizationData,
        auditTrail,
        exportDate: new Date().toISOString(),
        format
      }

      // Log data export
      await auditLogger.logDataAccess(
        userId,
        organizationId,
        'user_data',
        'export',
        new NextRequest(''),
        { format, exportDate: exportData.exportDate }
      )

      return exportData
    } catch (error) {
      console.error('Failed to export user data:', error)
      throw error
    }
  }

  // Delete all user data (GDPR compliance)
  public async deleteUserData(
    userId: string,
    organizationId: string,
    reason: string,
    requestedBy: string
  ): Promise<DataDeletionRequest> {
    try {
      // Check if requester has permission
      const hasPermission = await accessControlService.checkPermission(
        requestedBy,
        organizationId,
        'user',
        'delete'
      )

      if (!hasPermission.hasPermission) {
        throw new Error('Insufficient permissions to delete data')
      }

      // Create deletion request
      const deletionRequest: DataDeletionRequest = {
        userId,
        organizationId,
        reason,
        confirmationCode: this.generateConfirmationCode(),
        requestedBy,
        requestedAt: new Date().toISOString(),
        status: 'pending'
      }

      // Log deletion request
      await auditLogger.logDataAccess(
        requestedBy,
        organizationId,
        'user_data',
        'delete_request',
        new NextRequest(''),
        { 
          targetUserId: userId,
          reason,
          confirmationCode: deletionRequest.confirmationCode
        }
      )

      return deletionRequest
    } catch (error) {
      console.error('Failed to create deletion request:', error)
      throw error
    }
  }

  // Execute data deletion
  public async executeDataDeletion(
    deletionRequest: DataDeletionRequest,
    confirmationCode: string
  ): Promise<boolean> {
    try {
      // Verify confirmation code
      if (deletionRequest.confirmationCode !== confirmationCode) {
        throw new Error('Invalid confirmation code')
      }

      // Check if request is still pending
      if (deletionRequest.status !== 'pending') {
        throw new Error('Deletion request is not pending')
      }

      // Delete personal data
      await this.deletePersonalData(deletionRequest.userId, deletionRequest.organizationId)
      
      // Delete organization data
      await this.deleteOrganizationData(deletionRequest.userId, deletionRequest.organizationId)
      
      // Delete audit trail (with extended retention for compliance)
      await this.scheduleAuditTrailDeletion(deletionRequest.userId, deletionRequest.organizationId)

      // Log successful deletion
      await auditLogger.logDataAccess(
        deletionRequest.requestedBy,
        deletionRequest.organizationId,
        'user_data',
        'deleted',
        new NextRequest(''),
        { 
          targetUserId: deletionRequest.userId,
          reason: deletionRequest.reason,
          deletionDate: new Date().toISOString()
        }
      )

      return true
    } catch (error) {
      console.error('Failed to execute data deletion:', error)
      throw error
    }
  }

  // Collect personal data
  private async collectPersonalData(userId: string, organizationId: string): Promise<any> {
    try {
      // In production, this would query the database for user's personal data
      console.log('Collecting personal data for user:', userId)
      
      return {
        profile: {
          id: userId,
          email: 'user@example.com',
          name: 'User Name',
          avatar: null,
          preferences: {}
        },
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        },
        sessions: [
          {
            id: 'session-1',
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0...'
          }
        ]
      }
    } catch (error) {
      console.error('Failed to collect personal data:', error)
      return {}
    }
  }

  // Collect organization data
  private async collectOrganizationData(userId: string, organizationId: string): Promise<any> {
    try {
      // In production, this would query the database for organization data
      console.log('Collecting organization data for user:', userId)
      
      return {
        meetings: [],
        actions: [],
        analytics: [],
        files: []
      }
    } catch (error) {
      console.error('Failed to collect organization data:', error)
      return {}
    }
  }

  // Collect audit trail
  private async collectAuditTrail(userId: string, organizationId: string): Promise<any[]> {
    try {
      // In production, this would query the audit_logs table
      console.log('Collecting audit trail for user:', userId)
      
      return []
    } catch (error) {
      console.error('Failed to collect audit trail:', error)
      return []
    }
  }

  // Delete personal data
  private async deletePersonalData(userId: string, organizationId: string): Promise<void> {
    try {
      // In production, this would delete user's personal data
      console.log('Deleting personal data for user:', userId)
      
      // Delete user profile
      // Delete user preferences
      // Delete user sessions
      // Delete user files
    } catch (error) {
      console.error('Failed to delete personal data:', error)
      throw error
    }
  }

  // Delete organization data
  private async deleteOrganizationData(userId: string, organizationId: string): Promise<void> {
    try {
      // In production, this would delete user's organization data
      console.log('Deleting organization data for user:', userId)
      
      // Delete user's meetings
      // Delete user's actions
      // Delete user's analytics
      // Delete user's files
    } catch (error) {
      console.error('Failed to delete organization data:', error)
      throw error
    }
  }

  // Schedule audit trail deletion
  private async scheduleAuditTrailDeletion(userId: string, organizationId: string): Promise<void> {
    try {
      // In production, this would schedule audit trail deletion with extended retention
      console.log('Scheduling audit trail deletion for user:', userId)
      
      // Schedule deletion with extended retention for compliance
      await dataRetentionService.scheduleDataDeletion(
        organizationId,
        'audit_log',
        userId,
        2555 // 7 years for compliance
      )
    } catch (error) {
      console.error('Failed to schedule audit trail deletion:', error)
      throw error
    }
  }

  // Generate confirmation code
  private generateConfirmationCode(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  // Get data retention status
  public async getDataRetentionStatus(userId: string, organizationId: string): Promise<any> {
    try {
      const retentionStats = await dataRetentionService.getRetentionStats(organizationId)
      
      return {
        userId,
        organizationId,
        retentionStats,
        personalDataRetention: '90 days',
        organizationDataRetention: '90 days',
        auditTrailRetention: '7 years',
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to get data retention status:', error)
      return {}
    }
  }

  // Update data retention preferences
  public async updateDataRetentionPreferences(
    userId: string,
    organizationId: string,
    preferences: any
  ): Promise<void> {
    try {
      // Check permissions
      const hasPermission = await accessControlService.checkPermission(
        userId,
        organizationId,
        'user',
        'write'
      )

      if (!hasPermission.hasPermission) {
        throw new Error('Insufficient permissions to update retention preferences')
      }

      // Update retention preferences
      console.log('Updating data retention preferences:', {
        userId,
        organizationId,
        preferences
      })

      // Log preference update
      await auditLogger.logDataAccess(
        userId,
        organizationId,
        'user_preferences',
        'update',
        new NextRequest(''),
        { preferences }
      )
    } catch (error) {
      console.error('Failed to update data retention preferences:', error)
      throw error
    }
  }

  // Get data export history
  public async getDataExportHistory(userId: string, organizationId: string): Promise<any[]> {
    try {
      // In production, this would query the audit logs for export events
      console.log('Getting data export history for user:', userId)
      
      return []
    } catch (error) {
      console.error('Failed to get data export history:', error)
      return []
    }
  }

  // Validate data export request
  public async validateDataExportRequest(
    userId: string,
    organizationId: string,
    format: string
  ): Promise<{ valid: boolean; reason?: string }> {
    try {
      // Check if user exists and is active
      const userExists = await this.checkUserExists(userId, organizationId)
      if (!userExists) {
        return { valid: false, reason: 'User not found or inactive' }
      }

      // Check if format is supported
      const supportedFormats = ['json', 'csv', 'pdf']
      if (!supportedFormats.includes(format)) {
        return { valid: false, reason: 'Unsupported export format' }
      }

      // Check if user has recent export (rate limiting)
      const recentExports = await this.getRecentExports(userId, organizationId)
      if (recentExports.length > 0) {
        const lastExport = recentExports[0]
        const hoursSinceLastExport = (Date.now() - new Date(lastExport.exportDate).getTime()) / (1000 * 60 * 60)
        
        if (hoursSinceLastExport < 24) {
          return { valid: false, reason: 'Export rate limit exceeded. Please wait 24 hours.' }
        }
      }

      return { valid: true }
    } catch (error) {
      console.error('Failed to validate data export request:', error)
      return { valid: false, reason: 'Validation failed' }
    }
  }

  // Check if user exists
  private async checkUserExists(userId: string, organizationId: string): Promise<boolean> {
    try {
      // In production, this would query the database
      console.log('Checking if user exists:', { userId, organizationId })
      return true
    } catch (error) {
      console.error('Failed to check user existence:', error)
      return false
    }
  }

  // Get recent exports
  private async getRecentExports(userId: string, organizationId: string): Promise<any[]> {
    try {
      // In production, this would query the audit logs for recent exports
      console.log('Getting recent exports for user:', userId)
      return []
    } catch (error) {
      console.error('Failed to get recent exports:', error)
      return []
    }
  }
}

// Create singleton instance
export const userDataManagementService = UserDataManagementService.getInstance()

// Utility functions for common data management tasks
export const exportUserData = async (
  userId: string,
  organizationId: string,
  format: 'json' | 'csv' | 'pdf' = 'json'
): Promise<UserDataExport> => {
  return await userDataManagementService.exportUserData(userId, organizationId, format)
}

export const deleteUserData = async (
  userId: string,
  organizationId: string,
  reason: string,
  requestedBy: string
): Promise<DataDeletionRequest> => {
  return await userDataManagementService.deleteUserData(userId, organizationId, reason, requestedBy)
}

export const getDataRetentionStatus = async (
  userId: string,
  organizationId: string
): Promise<any> => {
  return await userDataManagementService.getDataRetentionStatus(userId, organizationId)
}
