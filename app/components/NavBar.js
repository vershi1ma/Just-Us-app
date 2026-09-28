'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/', label: 'Home', icon: '🏡' },
  { href: '/bucket-list', label: 'Bucket List', icon: '✨' },
  { href: '/goals', label: 'Goals', icon: '🎯' },
  { href: '/notes', label: 'Notes', icon: '💌' },
]

export default function NavBar() {
  const pathname = usePathname()

  if (pathname === '/login') return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-rose flex justify-around py-3">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={
            pathname === tab.href
              ? 'flex flex-col items-center text-rose font-bold'
              : 'flex flex-col items-center text-plum opacity-60'
          }
        >
          <span className="text-xl">{tab.icon}</span>
          <span className="text-xs">{tab.label}</span>
        </Link>
      ))}
    </nav>
  )
}
