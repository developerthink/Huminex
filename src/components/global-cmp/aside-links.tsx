'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const AsideLinks = ({item}: {item: {name: string, href: string, icon: React.ReactNode}}) => {
    const pathname = usePathname()
    const path = pathname.split("/").pop()?.toLowerCase()
  return (
    <li
    className={`hover:bg-primary/20 backdrop-blur-lg hover:text-primary font-medium *:p-2 *:px-4 rounded-full ${path === item.name.toLowerCase() ? "bg-primary/10 text-primary" : ""} `}
    key={item.name}
  >
    <Link className="flex items-center gap-2" href={item.href}>
      {item.icon}
      <span className="text-[15px] font-medium"> {item.name}</span>
    </Link>
  </li>
  )
}

export default AsideLinks