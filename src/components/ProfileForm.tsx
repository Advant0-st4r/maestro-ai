'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileFormData {
  file: FileList
}

export function ProfileForm() {
  const [isUploading, setIsUploading] = useState(false)
  const [fileError, setFileError] = useState('')
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>()

  const validateFile = (file: File) => {
    if (file.type !== 'application/json') {
      return 'Please upload a JSON file'
    }

    return null
  }

  const validateJSON = (content: string) => {
    try {
      const parsed = JSON.parse(content)
      
      // Check for required fields
      if (!parsed.company || !parsed.team_roles) {
        return 'JSON must contain "company" and "team_roles" fields'
      }

      return null
    } catch (error) {
      return 'Invalid JSON format'
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!data.file || data.file.length === 0) {
      setFileError('Please select a file')
      return
    }

    const file = data.file[0]
    const error = validateFile(file)
    
    if (error) {
      setFileError(error)
      return
    }

    setIsUploading(true)
    setFileError('')

    try {
      const content = await file.text()
      const jsonError = validateJSON(content)
      
      if (jsonError) {
        setFileError(jsonError)
        setIsUploading(false)
        return
      }

      const profileData = JSON.parse(content)

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      const result = await response.json()

      if (result.success) {
        // Store in localStorage for demo purposes
        localStorage.setItem('company_profile', JSON.stringify(profileData))
        toast.success('Profile uploaded! Personalization enabled.')
      } else {
        toast.error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Profile upload error:', error)
      toast.error('Failed to upload profile')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Example JSON Structure */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Example JSON Structure:</h3>
        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
{`{
  "company": {
    "name": "Acme Tech Solutions",
    "size": "15 employees",
    "industry": "B2B SaaS"
  },
  "team_roles": {
    "Sarah Chen": {
      "role": "CEO",
      "focus": "Strategy, fundraising"
    },
    "Marcus Lee": {
      "role": "Sales Lead", 
      "focus": "Pipeline, demos"
    }
  }
}`}
        </pre>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* File Input */}
        <div className="space-y-2">
          <Label htmlFor="profile-file">Company Profile JSON</Label>
          <Input
            id="profile-file"
            type="file"
            accept=".json"
            {...register('file', { required: 'File is required' })}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {fileError && (
            <p className="text-sm text-red-600">{fileError}</p>
          )}
          {errors.file && (
            <p className="text-sm text-red-600">{errors.file.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isUploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading Profile...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Profile
            </>
          )}
        </Button>
      </form>
    </div>
  )
}