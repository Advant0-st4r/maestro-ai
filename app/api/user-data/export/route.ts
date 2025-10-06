import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { userDataManagementService } from '@/lib/user-data-management'
import { auditLogger } from '@/lib/audit'
import { accessControlService } from '@/lib/access-control'

export async function POST(request: NextRequest) {
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

    const { format = 'json' } = await request.json()

    // Validate export request
    const validation = await userDataManagementService.validateDataExportRequest(
      session.user.id,
      session.user.organizationId || 'unknown',
      format
    )

    if (!validation.valid) {
      return NextResponse.json({ 
        error: validation.reason || 'Invalid export request' 
      }, { status: 400 })
    }

    // Export user data
    const exportData = await userDataManagementService.exportUserData(
      session.user.id,
      session.user.organizationId || 'unknown',
      format
    )

    // Log data export
    await auditLogger.logDataAccess(
      session.user.id,
      session.user.organizationId || 'unknown',
      'user_data',
      'export',
      request,
      { format, exportDate: exportData.exportDate }
    )

    return NextResponse.json({
      success: true,
      data: exportData,
      message: 'Data export completed successfully'
    })

  } catch (error) {
    console.error('Data export failed:', error)
    
    // Log security event
    await auditLogger.logSecurityEvent(
      session?.user?.id || 'unknown',
      session?.user?.organizationId || 'unknown',
      'suspicious_activity',
      request,
      { error: error instanceof Error ? error.message : 'Unknown error' }
    )

    return NextResponse.json({ 
      error: 'Failed to export data' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get export history
    const exportHistory = await userDataManagementService.getDataExportHistory(
      session.user.id,
      session.user.organizationId || 'unknown'
    )

    return NextResponse.json({
      success: true,
      exportHistory,
      message: 'Export history retrieved successfully'
    })

  } catch (error) {
    console.error('Failed to get export history:', error)
    return NextResponse.json({ 
      error: 'Failed to get export history' 
    }, { status: 500 })
  }
}
