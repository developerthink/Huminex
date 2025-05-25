'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { signOut } from 'next-auth/react';

const Logout = () => {
    const handleLogout = async () => {
        await signOut();
        redirect("/login");
      };
  return (
    <Button type="submit" className="!bg-red-500/20 !text-red-500 inset-x-3  absolute bottom-10" onClick={handleLogout}>
      Logout
    </Button>
  )
}

export default Logout