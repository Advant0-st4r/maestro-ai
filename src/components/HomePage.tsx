'use client'

import { useSession } from 'next-auth/react'
import { UploadForm } from '@/components/UploadForm'
import { ProfileForm } from '@/components/ProfileForm'
import { RecentMeetings } from '@/components/RecentMeetings'
import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'
import { LogIn } from 'lucide-react'

interface HomePageProps {
  session: any
}

export function HomePage({ session }: HomePageProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Headline Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">
            AI Meeting Triage + Smart Optimization
          </h1>
          <p className="text-lg text-gray-600">
            Beyond basics—upload audio + company profile for personalized tasks, 
            role-tailored emails, and efficiency suggestions.
          </p>
        </div>

        {/* Forms Section - Only visible when signed in */}
        {session ? (
          <div className="space-y-8">
            {/* Upload Form */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold text-black mb-4">
                Upload Meeting
              </h2>
              <UploadForm />
            </div>

            {/* Profile Form */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold text-black mb-4">
                Company Profile
              </h2>
              <ProfileForm />
            </div>

            {/* Recent Meetings */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold text-black mb-4">
                Recent Meetings
              </h2>
              <RecentMeetings />
            </div>
          </div>
        ) : (
          /* Unauthenticated State */
          <div className="text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mb-6">
              <p className="text-gray-600 mb-4">
                Please sign in to upload meetings and access your dashboard.
              </p>
              <Button
                onClick={() => signIn('google')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Sign in with Google
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
