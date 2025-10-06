import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profileData = await request.json()

    // Validate profile structure
    const requiredFields = ['company', 'team_roles']
    for (const field of requiredFields) {
      if (!profileData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    console.log('Profile upload:', {
      userId: session.user?.email,
      profileData,
    })

    // In production, store in database
    // For now, we'll rely on client-side localStorage

    return NextResponse.json({
      success: true,
      message: 'Profile uploaded successfully',
    })
  } catch (error) {
    console.error('Profile upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload profile' },
      { status: 500 }
    )
  }
}
