import { ClerkProvider, ClerkLoaded, ClerkLoading } from '@clerk/nextjs'
import { ReactNode } from 'react'

interface ClerkWrapperProps {
  children: ReactNode
}

export function ClerkWrapper({ children }: ClerkWrapperProps) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <ClerkLoaded>
        {children}
      </ClerkLoaded>
      <ClerkLoading>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </ClerkLoading>
    </ClerkProvider>
  )
}
