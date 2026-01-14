'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

import { ROUTES } from '@/constants'

interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
}

const navItems: NavItem[] = [
  { label: 'Rooms', href: ROUTES.ROOMS },
  { label: 'My Bookings', href: ROUTES.BOOKINGS }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className='border-divider bg-content1 flex h-full w-64 flex-col border-r'>
      <nav className='flex-1 space-y-1 p-4'>
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-default-600 hover:bg-default-100 hover:text-default-900'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
