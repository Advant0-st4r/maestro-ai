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
      'delete'
    )

    if (!hasPermission.hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { reason, confirmationCode } = await request.json()

    if (!reason || !confirmationCode) {
      return NextResponse.json({ 
        error: 'Reason and confirmation code are required' 
      }, { status: 400 })
    }

    // Create deletion request
    const deletionRequest = await userDataManagementService.deleteUserData(
      session.user.id,
      session.user.organizationId || 'unknown',
      reason,
      session.user.id
    )

    // Log deletion request
    await auditLogger.logDataAccess(
      session.user.id,
      session.user.organizationId || 'unknown',
      'user_data',
      'delete_request',
      request,
      { reason, confirmationCode: deletionRequest.confirmationCode }
    )

    return NextResponse.json({
      success: true,
      deletionRequest,
      message: 'Data deletion request created successfully'
    })

  } catch (error) {
    console.error('Data deletion request failed:', error)
    
    // Log security event
    await auditLogger.logSecurityEvent(
      session?.user?.id || 'unknown',
      session?.user?.organizationId || 'unknown',
      'suspicious_activity',
      request,
      { error: error instanceof Error ? error.message : 'Unknown error' }
    )

    return NextResponse.json({ 
      error: 'Failed to create deletion request' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { deletionRequestId, confirmationCode } = await request.json()

    if (!deletionRequestId || !confirmationCode) {
      return NextResponse.json({ 
        error: 'Deletion request ID and confirmation code are required' 
      }, { status: 400 })
    }

    // Execute data deletion
    const success = await userDataManagementService.executeDataDeletion(
      { 
        userId: session.user.id,
        organizationId: session.user.organizationId || 'unknown',
        reason: 'User requested',
        confirmationCode: deletionRequestId,
        requestedBy: session.user.id,
        requestedAt: new Date().toISOString(),
        status: 'pending'
      },
      confirmationCode
    )

    if (!success) {
      return NextResponse.json({ 
        error: 'Data deletion failed' 
      }, { status: 500 })
    }

    // Log successful deletion
    await auditLogger.logDataAccess(
      session.user.id,
      session.user.organizationId || 'unknown',
      'user_data',
      'deleted',
      request,
      { deletionDate: new Date().toISOString() }
    )

    return NextResponse.json({
      success: true,
      message: 'Data deletion completed successfully'
    })

  } catch (error) {
    console.error('Data deletion execution failed:', error)
    
    // Log security event
    await auditLogger.logSecurityEvent(
      session?.user?.id || 'unknown',
      session?.user?.organizationId || 'unknown',
      'suspicious_activity',
      request,
      { error: error instanceof Error ? error.message : 'Unknown error' }
    )

    return NextResponse.json({ 
      error: 'Failed to execute data deletion' 
    }, { status: 500 })
  }
}
