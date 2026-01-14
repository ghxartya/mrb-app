'use client'

import { Footer, Header, Sidebar } from '@/components'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex min-h-screen flex-col'>
      <Header />
      <div className='flex flex-1'>
        <Sidebar />
        <main className='bg-default-50 flex-1 overflow-auto p-6'>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}
