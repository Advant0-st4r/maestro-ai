import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../app/api/auth/[...nextauth]/route'

export type Permission = 'read' | 'write' | 'delete' | 'admin'
export type ResourceType = 'meeting' | 'action' | 'company' | 'user' | 'analytics' | 'file'

export interface AccessControl {
  userId: string
  organizationId: string
  resourceType: ResourceType
  resourceId?: string
  permission: Permission
  grantedBy: string
  grantedAt: Date
  expiresAt?: Date
  isActive: boolean
}

export interface PermissionCheck {
  hasPermission: boolean
  reason?: string
  requiredPermission?: Permission
  userPermission?: Permission
}

export class AccessControlService {
  private static instance: AccessControlService
  private supabase: any

  constructor() {
    this.supabase = null // Would be initialized with proper client
  }

  public static getInstance(): AccessControlService {
    if (!AccessControlService.instance) {
      AccessControlService.instance = new AccessControlService()
    }
    return AccessControlService.instance
  }

  // Grant permission to user
  public async grantPermission(
    organizationId: string,
    userId: string,
    resourceType: ResourceType,
    permission: Permission,
    grantedBy: string,
    resourceId?: string,
    expiresAt?: Date
  ): Promise<void> {
    try {
      // In production, this would insert into access_controls table
      console.log('Granting permission:', {
        organizationId,
        userId,
        resourceType,
        permission,
        grantedBy,
        resourceId,
        expiresAt
      })

      // Log the permission grant
      // await auditLogger.logDataAccess(
      //   grantedBy,
      //   organizationId,
      //   'access_control',
      //   'grant',
      //   request,
      //   { targetUserId: userId, permission, resourceType }
      // )
    } catch (error) {
      console.error('Failed to grant permission:', error)
      throw error
    }
  }

  // Revoke permission from user
  public async revokePermission(
    organizationId: string,
    userId: string,
    resourceType: ResourceType,
    resourceId?: string
  ): Promise<void> {
    try {
      // In production, this would update access_controls table
      console.log('Revoking permission:', {
        organizationId,
        userId,
        resourceType,
        resourceId
      })
    } catch (error) {
      console.error('Failed to revoke permission:', error)
      throw error
    }
  }

  // Check if user has permission
  public async checkPermission(
    userId: string,
    organizationId: string,
    resourceType: ResourceType,
    requiredPermission: Permission,
    resourceId?: string
  ): Promise<PermissionCheck> {
    try {
      // In production, this would query access_controls table
      console.log('Checking permission:', {
        userId,
        organizationId,
        resourceType,
        requiredPermission,
        resourceId
      })

      // Default permission logic based on user role and resource type
      const userRole = await this.getUserRole(userId, organizationId)
      const hasPermission = this.evaluatePermission(userRole, resourceType, requiredPermission)

      return {
        hasPermission,
        requiredPermission,
        userPermission: hasPermission ? requiredPermission : undefined,
        reason: hasPermission ? undefined : 'Insufficient permissions'
      }
    } catch (error) {
      console.error('Failed to check permission:', error)
      return {
        hasPermission: false,
        reason: 'Permission check failed'
      }
    }
  }

  // Get user role in organization
  private async getUserRole(userId: string, organizationId: string): Promise<string> {
    try {
      // In production, this would query users table
      console.log('Getting user role:', { userId, organizationId })
      
      // Default to 'user' role
      return 'user'
    } catch (error) {
      console.error('Failed to get user role:', error)
      return 'user'
    }
  }

  // Evaluate permission based on role and resource
  private evaluatePermission(
    userRole: string,
    resourceType: ResourceType,
    requiredPermission: Permission
  ): boolean {
    // Role-based permission matrix
    const rolePermissions: Record<string, Record<ResourceType, Permission[]>> = {
      'owner': {
        'meeting': ['read', 'write', 'delete', 'admin'],
        'action': ['read', 'write', 'delete', 'admin'],
        'company': ['read', 'write', 'delete', 'admin'],
        'user': ['read', 'write', 'delete', 'admin'],
        'analytics': ['read', 'write', 'delete', 'admin'],
        'file': ['read', 'write', 'delete', 'admin']
      },
      'admin': {
        'meeting': ['read', 'write', 'delete'],
        'action': ['read', 'write', 'delete'],
        'company': ['read', 'write', 'delete'],
        'user': ['read', 'write'],
        'analytics': ['read', 'write', 'delete'],
        'file': ['read', 'write', 'delete']
      },
      'user': {
        'meeting': ['read', 'write'],
        'action': ['read', 'write'],
        'company': ['read'],
        'user': ['read'],
        'analytics': ['read'],
        'file': ['read', 'write']
      }
    }

    const userPermissions = rolePermissions[userRole]?.[resourceType] || []
    return userPermissions.includes(requiredPermission)
  }

  // Check if user can access resource
  public async canAccessResource(
    userId: string,
    organizationId: string,
    resourceType: ResourceType,
    resourceId: string,
    permission: Permission = 'read'
  ): Promise<boolean> {
    try {
      const permissionCheck = await this.checkPermission(
        userId,
        organizationId,
        resourceType,
        permission,
        resourceId
      )

      return permissionCheck.hasPermission
    } catch (error) {
      console.error('Failed to check resource access:', error)
      return false
    }
  }

  // Get user permissions for resource type
  public async getUserPermissions(
    userId: string,
    organizationId: string,
    resourceType: ResourceType
  ): Promise<Permission[]> {
    try {
      const userRole = await this.getUserRole(userId, organizationId)
      
      const rolePermissions: Record<string, Record<ResourceType, Permission[]>> = {
        'owner': {
          'meeting': ['read', 'write', 'delete', 'admin'],
          'action': ['read', 'write', 'delete', 'admin'],
          'company': ['read', 'write', 'delete', 'admin'],
          'user': ['read', 'write', 'delete', 'admin'],
          'analytics': ['read', 'write', 'delete', 'admin'],
          'file': ['read', 'write', 'delete', 'admin']
        },
        'admin': {
          'meeting': ['read', 'write', 'delete'],
          'action': ['read', 'write', 'delete'],
          'company': ['read', 'write', 'delete'],
          'user': ['read', 'write'],
          'analytics': ['read', 'write', 'delete'],
          'file': ['read', 'write', 'delete']
        },
        'user': {
          'meeting': ['read', 'write'],
          'action': ['read', 'write'],
          'company': ['read'],
          'user': ['read'],
          'analytics': ['read'],
          'file': ['read', 'write']
        }
      }

      return rolePermissions[userRole]?.[resourceType] || []
    } catch (error) {
      console.error('Failed to get user permissions:', error)
      return []
    }
  }

  // Check if user is organization admin
  public async isOrganizationAdmin(userId: string, organizationId: string): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId, organizationId)
      return userRole === 'admin' || userRole === 'owner'
    } catch (error) {
      console.error('Failed to check admin status:', error)
      return false
    }
  }

  // Check if user is organization owner
  public async isOrganizationOwner(userId: string, organizationId: string): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId, organizationId)
      return userRole === 'owner'
    } catch (error) {
      console.error('Failed to check owner status:', error)
      return false
    }
  }

  // Get organization members
  public async getOrganizationMembers(organizationId: string): Promise<any[]> {
    try {
      // In production, this would query users table
      console.log('Getting organization members:', organizationId)
      return []
    } catch (error) {
      console.error('Failed to get organization members:', error)
      return []
    }
  }

  // Update user role
  public async updateUserRole(
    organizationId: string,
    userId: string,
    newRole: string,
    updatedBy: string
  ): Promise<void> {
    try {
      // In production, this would update users table
      console.log('Updating user role:', {
        organizationId,
        userId,
        newRole,
        updatedBy
      })

      // Log the role change
      // await auditLogger.logDataAccess(
      //   updatedBy,
      //   organizationId,
      //   'user',
      //   'update',
      //   request,
      //   { targetUserId: userId, newRole }
      // )
    } catch (error) {
      console.error('Failed to update user role:', error)
      throw error
    }
  }

  // Get access control statistics
  public async getAccessControlStats(organizationId: string): Promise<any> {
    try {
      // In production, this would aggregate access control data
      console.log('Getting access control stats for organization:', organizationId)
      
      return {
        totalUsers: 0,
        activePermissions: 0,
        expiredPermissions: 0,
        roleDistribution: {},
        recentChanges: []
      }
    } catch (error) {
      console.error('Failed to get access control stats:', error)
      return {}
    }
  }
}

// Create singleton instance
export const accessControlService = AccessControlService.getInstance()

// Middleware for permission checking
export async function permissionMiddleware(
  requiredPermission: Permission,
  resourceType: ResourceType,
  resourceId?: string
) {
  return async (request: NextRequest, handler: (request: NextRequest) => Promise<Response>) => {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user) {
        return new Response('Unauthorized', { status: 401 })
      }

      const hasPermission = await accessControlService.checkPermission(
        session.user.id,
        session.user.organizationId || 'unknown',
        resourceType,
        requiredPermission,
        resourceId
      )

      if (!hasPermission.hasPermission) {
        return new Response('Forbidden', { status: 403 })
      }

      return await handler(request)
    } catch (error) {
      console.error('Permission middleware error:', error)
      return new Response('Internal Server Error', { status: 500 })
    }
  }
}

// Utility functions for common permission checks
export const requireReadPermission = (resourceType: ResourceType, resourceId?: string) => {
  return permissionMiddleware('read', resourceType, resourceId)
}

export const requireWritePermission = (resourceType: ResourceType, resourceId?: string) => {
  return permissionMiddleware('write', resourceType, resourceId)
}

export const requireDeletePermission = (resourceType: ResourceType, resourceId?: string) => {
  return permissionMiddleware('delete', resourceType, resourceId)
}

export const requireAdminPermission = (resourceType: ResourceType, resourceId?: string) => {
  return permissionMiddleware('admin', resourceType, resourceId)
}

// Helper function to check permissions in components
export const usePermissions = async (
  userId: string,
  organizationId: string,
  resourceType: ResourceType
): Promise<Permission[]> => {
  return await accessControlService.getUserPermissions(userId, organizationId, resourceType)
}
