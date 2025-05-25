'use client'
import { useParams, usePathname } from 'next/navigation';
import React from 'react'
import Link from 'next/link'

const StatusMenu = () => {
    const path = usePathname();
  return (
    <Link href={path}>
        {path.split("/").pop()}
    </Link>
  )
}

export default StatusMenu