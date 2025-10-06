'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Download, Trash2, Settings, Eye, Lock, AlertTriangle, CheckCircle } from 'lucide-react'

interface SecurityDashboardProps {
  userId: string
  organizationId: string
}

interface DataRetentionStatus {
  userId: string
  organizationId: string
  retentionStats: any
  personalDataRetention: string
  organizationDataRetention: string
  auditTrailRetention: string
  lastUpdated: string
}

interface ExportHistory {
  id: string
  format: string
  exportDate: string
  status: string
  downloadUrl?: string
}

export default function SecurityDashboard({ userId, organizationId }: SecurityDashboardProps) {
  const [retentionStatus, setRetentionStatus] = useState<DataRetentionStatus | null>(null)
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json')
  const [deletionReason, setDeletionReason] = useState('')
  const [confirmationCode, setConfirmationCode] = useState('')
  const [showDeletionForm, setShowDeletionForm] = useState(false)
  const [retentionPreferences, setRetentionPreferences] = useState({
    personalData: 90,
    organizationData: 90,
    auditTrail: 2555
  })

  useEffect(() => {
    loadRetentionStatus()
    loadExportHistory()
  }, [])

  const loadRetentionStatus = async () => {
    try {
      const response = await fetch('/api/user-data/retention')
      if (response.ok) {
        const data = await response.json()
        setRetentionStatus(data.retentionStatus)
      }
    } catch (error) {
      console.error('Failed to load retention status:', error)
    }
  }

  const loadExportHistory = async () => {
    try {
      const response = await fetch('/api/user-data/export')
      if (response.ok) {
        const data = await response.json()
        setExportHistory(data.exportHistory || [])
      }
    } catch (error) {
      console.error('Failed to load export history:', error)
    }
  }

  const handleDataExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/user-data/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format: exportFormat }),
      })

      if (response.ok) {
        const data = await response.json()
        alert('Data export completed successfully!')
        loadExportHistory()
      } else {
        const error = await response.json()
        alert(`Export failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDataDeletion = async () => {
    if (!deletionReason.trim()) {
      alert('Please provide a reason for data deletion.')
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch('/api/user-data/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: deletionReason }),
      })

      if (response.ok) {
        const data = await response.json()
        setConfirmationCode(data.deletionRequest.confirmationCode)
        setShowDeletionForm(true)
        alert('Deletion request created. Please confirm with the code provided.')
      } else {
        const error = await response.json()
        alert(`Deletion request failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Deletion request failed:', error)
      alert('Deletion request failed. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeletionConfirmation = async () => {
    if (!confirmationCode.trim()) {
      alert('Please enter the confirmation code.')
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch('/api/user-data/delete', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          deletionRequestId: confirmationCode,
          confirmationCode: confirmationCode 
        }),
      })

      if (response.ok) {
        alert('Data deletion completed successfully!')
        setShowDeletionForm(false)
        setDeletionReason('')
        setConfirmationCode('')
      } else {
        const error = await response.json()
        alert(`Deletion failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Deletion confirmation failed:', error)
      alert('Deletion confirmation failed. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRetentionUpdate = async () => {
    try {
      const response = await fetch('/api/user-data/retention', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences: retentionPreferences }),
      })

      if (response.ok) {
        alert('Retention preferences updated successfully!')
        loadRetentionStatus()
      } else {
        const error = await response.json()
        alert(`Update failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Retention update failed:', error)
      alert('Retention update failed. Please try again.')
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Security Dashboard</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="data-export">Data Export</TabsTrigger>
          <TabsTrigger value="data-deletion">Data Deletion</TabsTrigger>
          <TabsTrigger value="retention">Retention Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Retention</CardTitle>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {retentionStatus?.personalDataRetention || '90 days'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Personal data retention period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Export History</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{exportHistory.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total data exports
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Secure</div>
                <p className="text-xs text-muted-foreground">
                  All security measures active
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security Overview</CardTitle>
              <CardDescription>
                Your data security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span>Data Encryption</span>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Access Controls</span>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-green-600" />
                  <span>Audit Logging</span>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Your Data</CardTitle>
              <CardDescription>
                Download a copy of all your data in various formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="export-format">Export Format</Label>
                <Select value={exportFormat} onValueChange={(value: 'json' | 'csv' | 'pdf') => setExportFormat(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleDataExport} 
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Button>

              {exportHistory.length > 0 && (
                <div className="space-y-2">
                  <Label>Export History</Label>
                  <div className="space-y-2">
                    {exportHistory.map((exportItem) => (
                      <div key={exportItem.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-2">
                          <Download className="h-4 w-4" />
                          <span className="text-sm">
                            {exportItem.format.toUpperCase()} - {new Date(exportItem.exportDate).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge variant="outline">{exportItem.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-deletion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delete Your Data</CardTitle>
              <CardDescription>
                Permanently delete all your data from our systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This action cannot be undone. All your data will be permanently deleted.
                </AlertDescription>
              </Alert>

              {!showDeletionForm ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deletion-reason">Reason for Deletion</Label>
                    <Textarea
                      id="deletion-reason"
                      placeholder="Please provide a reason for data deletion..."
                      value={deletionReason}
                      onChange={(e) => setDeletionReason(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={handleDataDeletion} 
                    disabled={isDeleting}
                    variant="destructive"
                    className="w-full"
                  >
                    {isDeleting ? 'Processing...' : 'Request Data Deletion'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Deletion request created. Please enter the confirmation code to proceed.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="confirmation-code">Confirmation Code</Label>
                    <Input
                      id="confirmation-code"
                      placeholder="Enter confirmation code"
                      value={confirmationCode}
                      onChange={(e) => setConfirmationCode(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={handleDeletionConfirmation} 
                    disabled={isDeleting}
                    variant="destructive"
                    className="w-full"
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm Data Deletion'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Retention Settings</CardTitle>
              <CardDescription>
                Configure how long your data is retained
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="personal-data-retention">Personal Data (days)</Label>
                  <Input
                    id="personal-data-retention"
                    type="number"
                    value={retentionPreferences.personalData}
                    onChange={(e) => setRetentionPreferences({
                      ...retentionPreferences,
                      personalData: parseInt(e.target.value)
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization-data-retention">Organization Data (days)</Label>
                  <Input
                    id="organization-data-retention"
                    type="number"
                    value={retentionPreferences.organizationData}
                    onChange={(e) => setRetentionPreferences({
                      ...retentionPreferences,
                      organizationData: parseInt(e.target.value)
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audit-trail-retention">Audit Trail (days)</Label>
                  <Input
                    id="audit-trail-retention"
                    type="number"
                    value={retentionPreferences.auditTrail}
                    onChange={(e) => setRetentionPreferences({
                      ...retentionPreferences,
                      auditTrail: parseInt(e.target.value)
                    })}
                  />
                </div>
              </div>

              <Button onClick={handleRetentionUpdate} className="w-full">
                Update Retention Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
