'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { posthog } from '@/lib/posthog'

interface PostHogProviderProps {
  children: React.ReactNode
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user) {
      // Identify user for analytics
      posthog.identify(session.user.email!, {
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image,
      })
    }
  }, [session])

  return (
    <PHProvider client={posthog}>
      {children}
    </PHProvider>
  )
}
