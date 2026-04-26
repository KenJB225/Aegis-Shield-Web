'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/users', label: 'Users' },
  { href: '/activity-logs', label: 'Activity Logs' },
  { href: '/settings', label: 'Settings' },
]

export default function FixedNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed-nav" aria-label="Primary page navigation">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={isActive ? 'fixed-nav-link active' : 'fixed-nav-link'}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}