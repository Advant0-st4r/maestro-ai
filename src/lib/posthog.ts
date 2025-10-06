import { PostHog } from 'posthog-js'

export const posthog = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY!,
  {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false, // Disable automatic pageview capture
    capture_pageleave: true,
  }
)

// Analytics helper functions
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.capture(event, properties)
  }
}

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, properties)
  }
}

export const resetUser = () => {
  if (typeof window !== 'undefined') {
    posthog.reset()
  }
}

// Meeting-specific analytics
export const trackMeetingUpload = (meetingId: string, fileSize: number, duration: number) => {
  trackEvent('meeting_uploaded', {
    meeting_id: meetingId,
    file_size: fileSize,
    duration_minutes: duration,
  })
}

export const trackActionVerification = (meetingId: string, actionCount: number, revenueImpact: number) => {
  trackEvent('actions_verified', {
    meeting_id: meetingId,
    action_count: actionCount,
    revenue_impact: revenueImpact,
  })
}

export const trackDashboardView = (viewType: 'ceo' | 'individual') => {
  trackEvent('dashboard_viewed', {
    view_type: viewType,
  })
}

export const trackProfileUpload = (companySize: string, industry: string) => {
  trackEvent('profile_uploaded', {
    company_size: companySize,
    industry: industry,
  })
}
