import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'
import { HomePage } from '@/components/HomePage'

export default async function Home() {
  const session = await getServerSession(authOptions)

  return <HomePage session={session} />
}
