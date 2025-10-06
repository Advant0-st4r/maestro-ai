import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const meetingId = searchParams.get('meetingId')

    if (!meetingId) {
      return NextResponse.json(
        { error: 'Meeting ID is required' },
        { status: 400 }
      )
    }

    // Mock data - in production, fetch from database
    const mockData = {
      meeting_id: meetingId,
      duration_minutes: 42,
      participants: 5,
      actions: [
        {
          id: "1",
          action: "Send proposal to BigCorp",
          owner: "Marcus Lee",
          due: "2025-10-10",
          confidence: 0.95,
          priority: "revenue-critical",
          effort_hours: 2,
          revenue_impact: 50000,
          timestamp: "00:14:23",
          transcript_snippet: "I'll draft the enterprise pricing and send it over by Thursday.",
          suggestions: [
            "Include API pricing sheet",
            "Competitor sent theirs yesterday—move fast!",
            "Add case study from similar client"
          ]
        },
        {
          id: "2",
          action: "Research EU GDPR compliance requirements",
          owner: "Sarah Chen",
          due: "2025-10-20",
          confidence: 0.78,
          priority: "strategic",
          effort_hours: 6,
          revenue_impact: null,
          timestamp: "00:28:15",
          transcript_snippet: "We need to understand GDPR before launching in Europe.",
          suggestions: [
            "Assign to legal consultant?",
            "Links to Q4 goal: EU market entry",
            "Block 6 hours on calendar for deep work"
          ]
        },
        {
          id: "3",
          action: "Update Asana board with sprint tasks",
          owner: "Dev Team",
          due: "2025-10-12",
          confidence: 0.88,
          priority: "operational",
          effort_hours: 0.5,
          revenue_impact: null,
          timestamp: "00:35:40",
          transcript_snippet: "Let's make sure Asana reflects what we discussed.",
          suggestions: [
            "Quick win—batch with standup",
            "Use template from last sprint"
          ]
        },
        {
          id: "4",
          action: "Schedule demo with DataCo by Oct 8",
          owner: "Marcus Lee",
          due: "2025-10-08",
          confidence: 0.92,
          priority: "revenue-critical",
          effort_hours: 0.5,
          revenue_impact: 25000,
          timestamp: "00:18:45",
          transcript_snippet: "DataCo is interested in our enterprise solution. Let's get them on a demo.",
          suggestions: [
            "High-value client - prioritize",
            "Include Sarah in demo for enterprise context",
            "Prepare case studies from similar B2B clients"
          ]
        },
        {
          id: "5",
          action: "Follow up with OldClient LLC about renewal",
          owner: "Sarah Chen",
          due: "2025-10-15",
          confidence: 0.65,
          priority: "revenue-critical",
          effort_hours: 1,
          revenue_impact: 15000,
          timestamp: "00:22:30",
          transcript_snippet: "OldClient hasn't responded to our renewal emails. We need to escalate.",
          suggestions: [
            "Churn risk - escalate to CEO",
            "Offer discount for early renewal",
            "Schedule call with decision maker"
          ]
        }
      ],
      risks: [
        {
          type: "churn_risk_client",
          message: "Action mentions 'OldClient LLC' (churn-risk). Escalate to CEO?"
        },
        {
          type: "workload_warning",
          message: "Marcus assigned 8 tasks this week (avg: 4)"
        }
      ],
      suggestions: {
        batch_actions: ["Update CRM", "Send follow-up emails", "Schedule calls"],
        quick_wins: ["Update Asana board", "Send meeting notes", "Book demo room"],
        delegate: [
          {
            action: "Research EU GDPR compliance",
            suggestion: "Consider hiring legal consultant"
          }
        ]
      }
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error('Get actions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch actions' },
      { status: 500 }
    )
  }
}
