'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertTriangle, CheckCircle, Clock, DollarSign, Users, Target, Zap, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { trackActionVerification } from '@/lib/posthog'
import { MobileActionTable } from '@/components/MobileActionTable'

interface Action {
  id: string
  action: string
  owner: string
  due: string
  confidence: number
  priority: 'revenue-critical' | 'strategic' | 'operational' | 'low'
  effort_hours: number
  revenue_impact: number | null
  timestamp: string
  transcript_snippet: string
  suggestions: string[]
}

interface MeetingData {
  meeting_id: string
  duration_minutes: number
  participants: number
  actions: Action[]
  risks: Array<{
    type: string
    message: string
  }>
  suggestions: {
    batch_actions: string[]
    quick_wins: string[]
    delegate: Array<{
      action: string
      suggestion: string
    }>
  }
}

interface VerifyPageProps {
  meetingId: string
}

export function VerifyPage({ meetingId }: VerifyPageProps) {
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set())
  const router = useRouter()

  const { control, handleSubmit, watch, setValue, getValues } = useForm({
    defaultValues: {
      actions: [] as Action[]
    }
  })

  const { fields, update } = useFieldArray({
    control,
    name: 'actions'
  })

  useEffect(() => {
    fetchMeetingData()
  }, [meetingId])

  const fetchMeetingData = async () => {
    try {
      const response = await fetch(`/api/get-actions?meetingId=${meetingId}`)
      const data = await response.json()
      
      if (response.ok) {
        setMeetingData(data)
        // Initialize form with actions
        setValue('actions', data.actions)
      } else {
        toast.error('Failed to fetch meeting data')
      }
    } catch (error) {
      console.error('Error fetching meeting data:', error)
      toast.error('Failed to fetch meeting data')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingId,
          actions: data.actions
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Track analytics
        const actionCount = data.actions?.length || 0
        const revenueImpact = meetingData?.actions.reduce((sum, a) => sum + (a.revenue_impact || 0), 0) || 0
        trackActionVerification(meetingId, actionCount, revenueImpact)
        
        toast.success('Actions delivered successfully!')
        router.push('/')
      } else {
        toast.error(result.error || 'Failed to verify actions')
      }
    } catch (error) {
      console.error('Verify error:', error)
      toast.error('Failed to verify actions')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegenerateSuggestions = async () => {
    setIsRegenerating(true)
    try {
      // Mock API call to regenerate suggestions
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update suggestions in the form
      const currentActions = getValues('actions')
      const updatedActions = currentActions.map(action => ({
        ...action,
        suggestions: [
          ...action.suggestions,
          "Updated suggestion based on latest analysis"
        ]
      }))
      
      setValue('actions', updatedActions)
      toast.success('Suggestions regenerated successfully!')
    } catch (error) {
      toast.error('Failed to regenerate suggestions')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleBulkApprove = () => {
    const currentActions = getValues('actions')
    const highConfidenceActions = currentActions.filter(action => action.confidence > 0.85)
    
    if (highConfidenceActions.length === 0) {
      toast.error('No high-confidence actions to approve')
      return
    }
    
    // Auto-select high confidence actions
    const highConfidenceIds = new Set(highConfidenceActions.map(a => a.id))
    setSelectedActions(highConfidenceIds)
    toast.success(`Selected ${highConfidenceActions.length} high-confidence actions`)
  }

  const handleSelectAll = () => {
    const currentActions = getValues('actions')
    const allIds = new Set(currentActions.map(a => a.id))
    setSelectedActions(allIds)
  }

  const handleDeselectAll = () => {
    setSelectedActions(new Set())
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'revenue-critical':
        return '🔴'
      case 'strategic':
        return '🟣'
      case 'operational':
        return '🔵'
      default:
        return '⚪'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'revenue-critical':
        return 'bg-red-100 text-red-800'
      case 'strategic':
        return 'bg-purple-100 text-purple-800'
      case 'operational':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEffortBadge = (hours: number) => {
    if (hours <= 0.5) return { label: 'Quick', color: 'bg-green-100 text-green-800' }
    if (hours <= 2) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Long', color: 'bg-red-100 text-red-800' }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Analyzing meeting...</p>
        </div>
      </div>
    )
  }

  if (!meetingData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Failed to load meeting data</p>
        </div>
      </div>
    )
  }

  const revenueCritical = meetingData.actions.filter(a => a.priority === 'revenue-critical').length
  const strategic = meetingData.actions.filter(a => a.priority === 'strategic').length
  const operational = meetingData.actions.filter(a => a.priority === 'operational').length
  const totalEffort = meetingData.actions.reduce((sum, a) => sum + a.effort_hours, 0)
  const revenueImpact = meetingData.actions.reduce((sum, a) => sum + (a.revenue_impact || 0), 0)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Verify Actions for Meeting {meetingId}
          </h1>
          <p className="text-gray-600">
            Review and edit (1-2 min). Low confidence items flagged. AI suggestions for efficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats Card */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Meeting Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-2xl font-bold">{meetingData.duration_minutes} min</p>
                    <p className="text-sm text-gray-600">Duration</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold">{meetingData.participants}</p>
                    <p className="text-sm text-gray-600">Participants</p>
                  </div>
                  <div className="text-center">
                    <Target className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <p className="text-2xl font-bold">{meetingData.actions.length}</p>
                    <p className="text-sm text-gray-600">Total Actions</p>
                  </div>
                  <div className="text-center">
                    <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className="text-2xl font-bold">${(revenueImpact / 1000).toFixed(0)}K</p>
                    <p className="text-sm text-gray-600">Revenue Impact</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>🔴 Revenue-Critical: {revenueCritical}</span>
                    <span>🟣 Strategic: {strategic}</span>
                    <span>🔵 Operational: {operational}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    ⚡ Est. Time to Complete: {totalEffort} hours
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Alerts */}
            {meetingData.risks.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  <strong className="text-yellow-800">RISKS DETECTED</strong>
                  <ul className="mt-2 space-y-1">
                    {meetingData.risks.map((risk, index) => (
                      <li key={index} className="text-sm text-yellow-700">
                        • {risk.message}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Action Table */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Action Items</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Desktop Table */}
                  <div className="hidden lg:block">
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedActions.size === meetingData.actions.length && meetingData.actions.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleSelectAll()
                              } else {
                                handleDeselectAll()
                              }
                            }}
                            className="rounded"
                          />
                        </TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Effort</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Suggestions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meetingData.actions.map((action, index) => {
                        const effort = getEffortBadge(action.effort_hours)
                        const isSelected = selectedActions.has(action.id)
                        return (
                          <TableRow 
                            key={action.id} 
                            className={isSelected ? 'bg-blue-50' : ''}
                          >
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const newSelected = new Set(selectedActions)
                                    if (e.target.checked) {
                                      newSelected.add(action.id)
                                    } else {
                                      newSelected.delete(action.id)
                                    }
                                    setSelectedActions(newSelected)
                                  }}
                                  className="rounded"
                                />
                                <span className="text-lg">{getPriorityIcon(action.priority)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input
                                {...control.register(`actions.${index}.action`)}
                                className="min-w-[200px]"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.currentTarget.blur()
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                {...control.register(`actions.${index}.owner`)}
                                className="min-w-[120px]"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.currentTarget.blur()
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="date"
                                {...control.register(`actions.${index}.due`)}
                                className="min-w-[120px]"
                              />
                            </TableCell>
                            <TableCell>
                              <Badge className={effort.color}>
                                {effort.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress 
                                  value={action.confidence * 100} 
                                  className="w-16"
                                />
                                <span className="text-xs text-gray-600">
                                  {Math.round(action.confidence * 100)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {action.revenue_impact ? (
                                <span className="text-green-600 font-medium">
                                  ${(action.revenue_impact / 1000).toFixed(0)}K
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600" title={action.transcript_snippet}>
                                {action.timestamp}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Accordion type="single" collapsible>
                                <AccordionItem value={`suggestions-${index}`}>
                                  <AccordionTrigger className="text-xs">
                                    View
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <ul className="text-xs space-y-1">
                                      {action.suggestions.map((suggestion, i) => (
                                        <li key={i} className="text-gray-600">
                                          • {suggestion}
                                        </li>
                                      ))}
                                    </ul>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden">
                    <MobileActionTable
                      actions={meetingData.actions}
                      control={control}
                      selectedActions={selectedActions}
                      setSelectedActions={setSelectedActions}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between mt-6 space-y-3 sm:space-y-0">
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleRegenerateSuggestions}
                        disabled={isRegenerating}
                      >
                        {isRegenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          'Regenerate Suggestions'
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleBulkApprove}
                      >
                        Bulk Approve
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleSelectAll}
                      >
                        Select All
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleDeselectAll}
                      >
                        Deselect All
                      </Button>
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Delivering...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve & Deliver
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Smart Suggestions Panel */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Zap className="w-4 h-4 mr-2" />
                  AI OPTIMIZATION TIPS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2">💡 Batch Actions</h4>
                  <p className="text-xs text-gray-600">
                    {meetingData.suggestions.batch_actions.length} tasks can be done together (saves 1hr)
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">🚀 Quick Wins</h4>
                  <p className="text-xs text-gray-600">
                    Complete {meetingData.suggestions.quick_wins.length} tasks &lt;30min for momentum
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">🔄 Delegate</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {meetingData.suggestions.delegate.map((item, index) => (
                      <li key={index}>• {item.suggestion}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Preview Delivery */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-sm">Preview Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="email" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                    <TabsTrigger value="crm">CRM</TabsTrigger>
                    <TabsTrigger value="slack">Slack</TabsTrigger>
                  </TabsList>
                  <TabsContent value="email" className="mt-4">
                    <div className="bg-gray-50 p-3 rounded text-xs">
                      <p className="font-medium mb-2">Subject: 🎯 4 Revenue Actions from Oct 6 Meeting</p>
                      <p className="mb-2">Hi Marcus (Sales Lead),</p>
                      <p className="mb-2">Your action items (2 high-priority):</p>
                      <ul className="space-y-1 ml-4">
                        <li>🔴 Send BigCorp proposal by Oct 10 (Est: 2h)</li>
                        <li>🔴 Schedule demo with DataCo by Oct 8</li>
                      </ul>
                      <div className="mt-3 pt-2 border-t">
                        <button className="text-blue-600 hover:text-blue-800 text-xs">
                          Copy to clipboard
                        </button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="calendar" className="mt-4">
                    <div className="space-y-2">
                      <div className="text-xs bg-blue-50 p-2 rounded">
                        <strong>Mon:</strong> Send proposal, Update CRM (3h total)
                      </div>
                      <div className="text-xs bg-green-50 p-2 rounded">
                        <strong>Wed:</strong> Research competitors (2h)
                      </div>
                      <div className="mt-3 pt-2 border-t">
                        <button className="text-blue-600 hover:text-blue-800 text-xs">
                          Export to Google Calendar
                        </button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="crm" className="mt-4">
                    <div className="space-y-2">
                      <div className="text-xs bg-purple-50 p-2 rounded">
                        <strong>HubSpot Tasks:</strong>
                        <ul className="mt-1 ml-2">
                          <li>• Create deal: BigCorp ($50K)</li>
                          <li>• Schedule demo: DataCo</li>
                          <li>• Update contact: OldClient LLC</li>
                        </ul>
                      </div>
                      <div className="mt-3 pt-2 border-t">
                        <button className="text-blue-600 hover:text-blue-800 text-xs">
                          Sync to HubSpot
                        </button>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="slack" className="mt-4">
                    <div className="space-y-2">
                      <div className="text-xs bg-green-50 p-2 rounded">
                        <strong>#sales-team:</strong>
                        <p className="mt-1">🎯 Marcus: 2 high-priority actions from today's meeting</p>
                        <p>• Send BigCorp proposal (due Oct 10)</p>
                        <p>• Schedule DataCo demo (due Oct 8)</p>
                      </div>
                      <div className="mt-3 pt-2 border-t">
                        <button className="text-blue-600 hover:text-blue-800 text-xs">
                          Post to Slack
                        </button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
