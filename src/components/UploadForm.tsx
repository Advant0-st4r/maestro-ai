'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, FileAudio } from 'lucide-react'
import { toast } from 'sonner'
import { trackMeetingUpload } from '@/lib/posthog'

interface UploadFormData {
  file: FileList
  context: string
}

export function UploadForm() {
  const [isUploading, setIsUploading] = useState(false)
  const [fileError, setFileError] = useState('')
  const router = useRouter()
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<UploadFormData>()
  const fileInput = watch('file')

  const validateFile = (file: File) => {
    const allowedTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'video/mp4']
    const maxSize = 100 * 1024 * 1024 // 100MB

    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload MP3, MP4, or WAV files only.'
    }

    if (file.size > maxSize) {
      return 'File too large. Maximum size is 100MB.'
    }

    return null
  }

  const onSubmit = async (data: UploadFormData) => {
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
      const formData = new FormData()
      formData.append('file', file)
      formData.append('context', data.context || '')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // Track analytics
        trackMeetingUpload(result.meetingId, file.size, 0) // Duration would come from processing
        
        toast.success('Meeting uploaded successfully!')
        router.push(`/verify/${result.meetingId}`)
      } else {
        toast.error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload meeting')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* File Input */}
      <div className="space-y-2">
        <Label htmlFor="file">Audio/Video File</Label>
        <div className="relative">
          <Input
            id="file"
            type="file"
            accept=".mp3,.mp4,.wav"
            {...register('file', { required: 'File is required' })}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        {fileError && (
          <p className="text-sm text-red-600">{fileError}</p>
        )}
        {errors.file && (
          <p className="text-sm text-red-600">{errors.file.message}</p>
        )}
        <p className="text-sm text-gray-500">
          Supported formats: MP3, MP4, WAV (max 100MB)
        </p>
      </div>

      {/* Context Notes */}
      <div className="space-y-2">
        <Label htmlFor="context">Context Notes (Optional)</Label>
        <Textarea
          id="context"
          placeholder="E.g., Q4 focus meeting, client discussion, team standup..."
          {...register('context')}
          className="min-h-[80px]"
        />
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
            Processing Meeting...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Process Meeting
          </>
        )}
      </Button>
    </form>
  )
}