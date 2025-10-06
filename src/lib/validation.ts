import { z } from 'zod'

// File validation schemas
export const fileValidationSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 100 * 1024 * 1024, {
      message: "File size must be less than 100MB"
    })
    .refine(
      (file) => ['audio/mpeg', 'audio/mp4', 'audio/wav', 'video/mp4'].includes(file.type),
      {
        message: "File must be MP3, MP4, or WAV format"
      }
    ),
  context: z.string().optional()
})

// Profile validation schema
export const profileValidationSchema = z.object({
  company: z.object({
    name: z.string().min(1, "Company name is required"),
    size: z.string().optional(),
    industry: z.string().optional(),
    current_goals: z.object({
      q4_2025: z.array(z.string()).optional(),
      priorities: z.array(z.string()).optional()
    }).optional()
  }),
  team_roles: z.record(z.object({
    role: z.string().min(1, "Role is required"),
    focus: z.string().optional(),
    communication_style: z.string().optional(),
    meeting_days: z.array(z.string()).optional(),
    crm_link: z.string().optional()
  })).refine((roles) => Object.keys(roles).length > 0, {
    message: "At least one team role is required"
  }),
  clients: z.object({
    enterprise: z.array(z.string()).optional(),
    high_value: z.array(z.string()).optional(),
    churn_risk: z.array(z.string()).optional()
  }).optional(),
  competitors: z.array(z.string()).optional(),
  integrations: z.object({
    crm: z.string().optional(),
    project_mgmt: z.string().optional(),
    calendar: z.string().optional()
  }).optional()
})

// Action validation schema
export const actionValidationSchema = z.object({
  id: z.string(),
  action: z.string().min(1, "Action is required"),
  owner: z.string().min(1, "Owner is required"),
  due: z.string().min(1, "Due date is required"),
  confidence: z.number().min(0).max(1),
  priority: z.enum(['revenue-critical', 'strategic', 'operational', 'low']),
  effort_hours: z.number().min(0),
  revenue_impact: z.number().nullable(),
  timestamp: z.string(),
  transcript_snippet: z.string(),
  suggestions: z.array(z.string())
})

// Meeting validation schema
export const meetingValidationSchema = z.object({
  meetingId: z.string().uuid("Invalid meeting ID"),
  actions: z.array(actionValidationSchema).min(1, "At least one action is required")
})

// Form validation helpers
export const validateFile = (file: File): string | null => {
  const maxSize = 100 * 1024 * 1024 // 100MB
  const allowedTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'video/mp4']

  if (!allowedTypes.includes(file.type)) {
    return 'Invalid file type. Please upload MP3, MP4, or WAV files only.'
  }

  if (file.size > maxSize) {
    return 'File too large. Maximum size is 100MB.'
  }

  return null
}

export const validateProfile = (profileData: any): string | null => {
  try {
    profileValidationSchema.parse(profileData)
    return null
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map(e => e.message).join(', ')
    }
    return 'Invalid profile data format'
  }
}

export const validateActions = (actions: any[]): string | null => {
  try {
    z.array(actionValidationSchema).parse(actions)
    return null
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map(e => e.message).join(', ')
    }
    return 'Invalid action data format'
  }
}

// Real-time validation helpers
export const validateActionField = (field: string, value: any): string | null => {
  switch (field) {
    case 'action':
      if (!value || value.trim().length === 0) {
        return 'Action is required'
      }
      if (value.length > 500) {
        return 'Action must be less than 500 characters'
      }
      break
    case 'owner':
      if (!value || value.trim().length === 0) {
        return 'Owner is required'
      }
      if (value.length > 100) {
        return 'Owner name must be less than 100 characters'
      }
      break
    case 'due':
      if (!value) {
        return 'Due date is required'
      }
      const dueDate = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (dueDate < today) {
        return 'Due date cannot be in the past'
      }
      break
    default:
      return null
  }
  return null
}

// Email validation for delivery previews
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// URL validation for integrations
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Date validation helpers
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today
}

// Confidence score validation
export const validateConfidence = (confidence: number): boolean => {
  return confidence >= 0 && confidence <= 1
}

// Priority validation
export const validatePriority = (priority: string): boolean => {
  return ['revenue-critical', 'strategic', 'operational', 'low'].includes(priority)
}

// Effort hours validation
export const validateEffortHours = (hours: number): boolean => {
  return hours >= 0 && hours <= 100 // Max 100 hours
}

// Revenue impact validation
export const validateRevenueImpact = (impact: number | null): boolean => {
  if (impact === null) return true
  return impact >= 0 && impact <= 10000000 // Max $10M
}
