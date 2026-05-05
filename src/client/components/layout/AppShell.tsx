import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { ConnectivityBanner } from '@/client/components/shared/ConnectivityBanner'
import { Toaster } from '@/client/components/ui/toaster'

interface Props {
  children: ReactNode
}

export function AppShell({ children }: Props) {
  return (
    <div className="flex min-h-dvh flex-col">
      <ConnectivityBanner />
      <main className="flex-1 pb-16">{children}</main>
      <BottomNav />
      <Toaster />
    </div>
  )
}
