'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Eye, Clock, CheckCircle } from 'lucide-react'

interface Meeting {
  id: string
  date: string
  status: 'processing' | 'ready' | 'completed'
  actions: number
}

export function RecentMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])

  useEffect(() => {
    // Mock data - in production, fetch from API
    const mockMeetings: Meeting[] = [
      {
        id: 'abc-123',
        date: '2025-01-15',
        status: 'ready',
        actions: 5
      },
      {
        id: 'def-456',
        date: '2025-01-14',
        status: 'completed',
        actions: 3
      }
    ]
    setMeetings(mockMeetings)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Processing</Badge>
      case 'ready':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Ready</Badge>
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No meetings yet. Upload your first one!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Meeting ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead className="text-right">View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meetings.map((meeting) => (
            <TableRow key={meeting.id}>
              <TableCell className="font-mono text-sm">{meeting.id}</TableCell>
              <TableCell>{new Date(meeting.date).toLocaleDateString()}</TableCell>
              <TableCell>{getStatusBadge(meeting.status)}</TableCell>
              <TableCell>{meeting.actions} items</TableCell>
              <TableCell className="text-right">
                <Link href={`/verify/${meeting.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
