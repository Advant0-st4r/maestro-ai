import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import SecurityDashboard from '@/components/SecurityDashboard'

export default async function SecurityPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth')
  }

  return (
    <SecurityDashboard 
      userId={session.user.id}
      organizationId={session.user.organizationId || 'unknown'}
    />
  )
}
