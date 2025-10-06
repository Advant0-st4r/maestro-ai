import { getServerSession } from 'next-auth'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { VerifyPage } from '@/components/VerifyPage'

interface VerifyPageProps {
  params: {
    meetingId: string
  }
}

export default async function Verify({ params }: VerifyPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/')
  }

  return <VerifyPage meetingId={params.meetingId} />
}
