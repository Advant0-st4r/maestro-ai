'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import Link from 'next/link'

interface ErrorFallbackProps {
  error?: Error
  resetError: () => void
  title?: string
  message?: string
  showDetails?: boolean
}

export function ErrorFallback({ 
  error, 
  resetError, 
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try refreshing the page.",
  showDetails = false
}: ErrorFallbackProps) {
  const handleReportError = () => {
    // In production, this would send error to monitoring service
    console.error('User reported error:', error)
    alert('Error reported. Thank you for your feedback!')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-900">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {message}
          </p>
          
          {showDetails && error && (
            <details className="text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                Error details
              </summary>
              <div className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-32">
                <pre className="whitespace-pre-wrap text-gray-600">
                  {error.message}
                  {error.stack && `\n\nStack trace:\n${error.stack}`}
                </pre>
              </div>
            </details>
          )}

          <div className="flex flex-col space-y-3">
            <div className="flex space-x-3">
              <Button
                onClick={resetError}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Refresh Page
              </Button>
            </div>
            
            <div className="flex space-x-3">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
              <Button
                onClick={handleReportError}
                variant="outline"
                className="flex-1"
              >
                <Bug className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </div>
          </div>

          <div className="text-xs text-gray-500 pt-4 border-t">
            <p>If this problem persists, please contact support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Specific error fallbacks for different scenarios
export function UploadErrorFallback({ resetError }: { resetError: () => void }) {
  return (
    <ErrorFallback
      resetError={resetError}
      title="Upload Failed"
      message="We couldn't process your meeting file. Please check the file format and try again."
    />
  )
}

export function NetworkErrorFallback({ resetError }: { resetError: () => void }) {
  return (
    <ErrorFallback
      resetError={resetError}
      title="Connection Error"
      message="Please check your internet connection and try again."
    />
  )
}

export function AuthErrorFallback({ resetError }: { resetError: () => void }) {
  return (
    <ErrorFallback
      resetError={resetError}
      title="Authentication Required"
      message="Please sign in to continue using Meeting Maestro."
    />
  )
}
