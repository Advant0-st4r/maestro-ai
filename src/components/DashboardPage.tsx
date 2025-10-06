'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Clock, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target, 
  AlertTriangle,
  Calendar,
  BarChart3,
  Zap
} from 'lucide-react'
import { trackDashboardView } from '@/lib/posthog'

export function DashboardPage() {
  const [view, setView] = useState<'ceo' | 'individual'>('ceo')

  useEffect(() => {
    // Track dashboard view
    trackDashboardView(view)
  }, [view])

  // Mock data - in production, fetch from API
  const mockData = {
    timeSaved: 12,
    actionsCompleted: 84,
    revenueActions: { completed: 18, total: 22, value: 340000 },
    strategicInitiatives: 5,
    teamProductivity: [
      { name: 'Sarah', actions: 15, completion: 93 },
      { name: 'Marcus', actions: 22, completion: 86, warning: true },
      { name: 'Dev Team', actions: 18, completion: 91 }
    ],
    insights: [
      { type: 'trend', message: '"EU expansion" mentioned in 4 meetings → Create project?' },
      { type: 'blocker', message: '"API product" blocked 3x → Dependency issue?' },
      { type: 'improvement', message: 'Meeting efficiency +20% (fewer follow-up meetings needed)' }
    ],
    individualActions: {
      highPriority: 2,
      strategic: 1,
      operational: 5
    },
    upcomingWeek: [
      { day: 'Mon', tasks: ['Send proposal', 'Update CRM'], duration: '3h total' },
      { day: 'Wed', tasks: ['Research competitors'], duration: '2h' },
      { day: 'Fri', tasks: ['Team sync prep'], duration: '30min' }
    ],
    achievements: [
      'Closed 3 deals ahead of schedule',
      'Completed 12 "quick wins"'
    ]
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Meeting ROI Dashboard
          </h1>
          <p className="text-gray-600">
            Track productivity, revenue impact, and team performance
          </p>
        </div>

        {/* View Toggle */}
        <div className="mb-6">
          <Tabs value={view} onValueChange={(value) => setView(value as 'ceo' | 'individual')}>
            <TabsList>
              <TabsTrigger value="ceo">CEO/Leadership View</TabsTrigger>
              <TabsTrigger value="individual">Individual View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {view === 'ceo' ? (
          <div className="space-y-6">
            {/* This Month Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Time Saved</p>
                      <p className="text-2xl font-bold text-black">{mockData.timeSaved} hours</p>
                      <p className="text-xs text-gray-500">vs manual follow-ups</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Actions Completed</p>
                      <p className="text-2xl font-bold text-black">{mockData.actionsCompleted}%</p>
                      <p className="text-xs text-green-600">+15% vs last month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Revenue Actions</p>
                      <p className="text-2xl font-bold text-black">
                        {mockData.revenueActions.completed}/{mockData.revenueActions.total}
                      </p>
                      <p className="text-xs text-green-600">
                        ${(mockData.revenueActions.value / 1000).toFixed(0)}K deals closed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Target className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Strategic Initiatives</p>
                      <p className="text-2xl font-bold text-black">{mockData.strategicInitiatives}</p>
                      <p className="text-xs text-gray-500">Q4 goals tracked</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Productivity */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Team Productivity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockData.teamProductivity.map((member, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.actions} actions</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24">
                          <Progress value={member.completion} className="h-2" />
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{member.completion}%</p>
                          {member.warning && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                              ⚠️ Workload high
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockData.insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {insight.type === 'trend' && <TrendingUp className="w-4 h-4 text-blue-600" />}
                        {insight.type === 'blocker' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                        {insight.type === 'improvement' && <Zap className="w-4 h-4 text-green-600" />}
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">{insight.message}</p>
                        <button className="text-xs text-blue-600 hover:text-blue-800 mt-1">
                          View Details →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Individual Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="w-6 h-6 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-black">{mockData.individualActions.highPriority}</p>
                    <p className="text-sm text-gray-600">High Priority</p>
                    <p className="text-xs text-red-600 mt-1">← Due this week!</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-black">{mockData.individualActions.strategic}</p>
                    <p className="text-sm text-gray-600">Strategic</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-black">{mockData.individualActions.operational}</p>
                    <p className="text-sm text-gray-600">Operational</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming This Week */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Upcoming This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockData.upcomingWeek.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{day.day}</p>
                        <p className="text-sm text-gray-600">
                          {day.tasks.join(', ')}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {day.duration}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Achievements This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockData.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-yellow-500">🏆</span>
                      <span className="text-sm text-gray-700">{achievement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
