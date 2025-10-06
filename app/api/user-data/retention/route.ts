import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { userDataManagementService } from '@/lib/user-data-management'
import { auditLogger } from '@/lib/audit'
import { accessControlService } from '@/lib/access-control'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = await accessControlService.checkPermission(
      session.user.id,
      session.user.organizationId || 'unknown',
      'user',
      'read'
    )

    if (!hasPermission.hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get data retention status
    const retentionStatus = await userDataManagementService.getDataRetentionStatus(
      session.user.id,
      session.user.organizationId || 'unknown'
    )

    return NextResponse.json({
      success: true,
      retentionStatus,
      message: 'Data retention status retrieved successfully'
    })

  } catch (error) {
    console.error('Failed to get retention status:', error)
    return NextResponse.json({ 
      error: 'Failed to get retention status' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = await accessControlService.checkPermission(
      session.user.id,
      session.user.organizationId || 'unknown',
      'user',
      'write'
    )

    if (!hasPermission.hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { preferences } = await request.json()

    if (!preferences) {
      return NextResponse.json({ 
        error: 'Retention preferences are required' 
      }, { status: 400 })
    }

    // Update data retention preferences
    await userDataManagementService.updateDataRetentionPreferences(
      session.user.id,
      session.user.organizationId || 'unknown',
      preferences
    )

    // Log preference update
    await auditLogger.logDataAccess(
      session.user.id,
      session.user.organizationId || 'unknown',
      'user_preferences',
      'update',
      request,
      { preferences }
    )

    return NextResponse.json({
      success: true,
      message: 'Data retention preferences updated successfully'
    })

  } catch (error) {
    console.error('Failed to update retention preferences:', error)
    
    // Log security event
    await auditLogger.logSecurityEvent(
      session?.user?.id || 'unknown',
      session?.user?.organizationId || 'unknown',
      'suspicious_activity',
      request,
      { error: error instanceof Error ? error.message : 'Unknown error' }
    )

    return NextResponse.json({ 
      error: 'Failed to update retention preferences' 
    }, { status: 500 })
  }
}
