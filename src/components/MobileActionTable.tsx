'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ChevronDown, ChevronUp, Edit3, Check, X } from 'lucide-react'

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

interface MobileActionTableProps {
  actions: Action[]
  control: any
  selectedActions: Set<string>
  setSelectedActions: (actions: Set<string>) => void
}

export function MobileActionTable({ 
  actions, 
  control, 
  selectedActions, 
  setSelectedActions 
}: MobileActionTableProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [editingCard, setEditingCard] = useState<string | null>(null)

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'revenue-critical': return '🔴'
      case 'strategic': return '🟣'
      case 'operational': return '🔵'
      default: return '⚪'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'revenue-critical': return 'bg-red-100 text-red-800'
      case 'strategic': return 'bg-purple-100 text-purple-800'
      case 'operational': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEffortBadge = (hours: number) => {
    if (hours <= 0.5) return { label: 'Quick', color: 'bg-green-100 text-green-800' }
    if (hours <= 2) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Long', color: 'bg-red-100 text-red-800' }
  }

  const toggleSelection = (actionId: string) => {
    const newSelected = new Set(selectedActions)
    if (newSelected.has(actionId)) {
      newSelected.delete(actionId)
    } else {
      newSelected.add(actionId)
    }
    setSelectedActions(newSelected)
  }

  const toggleExpanded = (actionId: string) => {
    setExpandedCard(expandedCard === actionId ? null : actionId)
  }

  const toggleEditing = (actionId: string) => {
    setEditingCard(editingCard === actionId ? null : actionId)
  }

  return (
    <div className="space-y-4">
      {actions.map((action, index) => {
        const effort = getEffortBadge(action.effort_hours)
        const isSelected = selectedActions.has(action.id)
        const isExpanded = expandedCard === action.id
        const isEditing = editingCard === action.id

        return (
          <Card 
            key={action.id} 
            className={`shadow-md transition-all duration-200 ${
              isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(action.id)}
                    className="rounded w-4 h-4"
                  />
                  <span className="text-lg">{getPriorityIcon(action.priority)}</span>
                  <Badge className={getPriorityColor(action.priority)}>
                    {action.priority.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleEditing(action.id)}
                  >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(action.id)}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Action Text */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Action</label>
                {isEditing ? (
                  <Input
                    {...control.register(`actions.${index}.action`)}
                    className="w-full"
                    placeholder="Enter action item..."
                  />
                ) : (
                  <p className="text-gray-900">{action.action}</p>
                )}
              </div>

              {/* Owner and Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Owner</label>
                  {isEditing ? (
                    <Input
                      {...control.register(`actions.${index}.owner`)}
                      className="w-full"
                      placeholder="Assign owner..."
                    />
                  ) : (
                    <p className="text-gray-900">{action.owner}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Due Date</label>
                  {isEditing ? (
                    <Input
                      type="date"
                      {...control.register(`actions.${index}.due`)}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-gray-900">{action.due}</p>
                  )}
                </div>
              </div>

              {/* Effort and Confidence */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Effort</label>
                  <Badge className={effort.color}>
                    {effort.label}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Confidence</label>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={action.confidence * 100} 
                      className="flex-1 h-2"
                    />
                    <span className="text-xs text-gray-600">
                      {Math.round(action.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Revenue Impact */}
              {action.revenue_impact && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Revenue Impact</label>
                  <p className="text-green-600 font-medium">
                    ${(action.revenue_impact / 1000).toFixed(0)}K
                  </p>
                </div>
              )}

              {/* Expanded Content */}
              {isExpanded && (
                <div className="space-y-4 pt-4 border-t">
                  {/* Timestamp */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Timestamp</label>
                    <p className="text-sm text-gray-600" title={action.transcript_snippet}>
                      {action.timestamp}
                    </p>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">AI Suggestions</label>
                    <Accordion type="single" collapsible>
                      <AccordionItem value={`suggestions-${index}`}>
                        <AccordionTrigger className="text-sm">
                          View {action.suggestions.length} suggestions
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2 mt-2">
                            {action.suggestions.map((suggestion, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start">
                                <span className="mr-2">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
