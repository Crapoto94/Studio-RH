'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') {
      router.push('/unauthorized')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#6366f1]" />
      </div>
    )
  }

  if (status === 'authenticated' && (session?.user as any)?.role === 'admin') {
    return <>{children}</>
  }

  return null
}
