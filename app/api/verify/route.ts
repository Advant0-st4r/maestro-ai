import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { meetingId, actions } = await request.json()

    if (!meetingId || !actions) {
      return NextResponse.json(
        { error: 'Meeting ID and actions are required' },
        { status: 400 }
      )
    }

    console.log('Actions verified:', {
      meetingId,
      actions,
      userId: session.user?.email,
    })

    // Mock delivery simulation
    const deliveries = {
      emails_sent: actions.filter((a: any) => a.owner).length,
      calendar_events_created: actions.filter((a: any) => a.due && a.due !== 'TBD').length,
      crm_updates: actions.filter((a: any) => a.priority === 'revenue-critical').length,
    }

    return NextResponse.json({
      success: true,
      message: 'Actions approved and delivered',
      deliveries,
    })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json(
      { error: 'Failed to verify actions' },
      { status: 500 }
    )
  }
}
