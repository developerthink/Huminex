import React from 'react'
import Image from 'next/image'

const Logo = ({ className}: {className?: string}) => {
  return (
    <div className="flex items-center">
      <Image width={50} height={50} src="/logo.png" alt="Logo" className={className} />
    </div>
  )
}

export default Logo