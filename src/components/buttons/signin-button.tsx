'use client'

import { applicationConfig } from '@/config/app-config'
import { useAuth } from '@/hooks/useAuth'
// import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog'
import { Link } from '@tanstack/react-router'
// import { XIcon } from 'lucide-react'
import { useState } from 'react'
import { GoogleIcon } from '../icons/signin-button-icons'
// import {
//   AlertDialog,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogPortal,
//   AlertDialogTitle,
// } from '../ui/alert-dialog'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'

export const SignInButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { isLoggedIn, isLoading } = useAuth()

  const handleSignIn = () => {
    if (isLoggedIn) return
    window.location.href = `${applicationConfig.backendApplicationURL}/v1/auth/google/login`
  }

  if (isLoading) {
    return (
      <Button>
        <Skeleton>Loading...</Skeleton>
      </Button>
    )
  }

  if (isLoggedIn) {
    return (
      <Button className="bg-blue-600 text-white hover:bg-blue-700">
        <Link to="/feed">Open Feed</Link>
      </Button>
    )
  }

  return (
    <Button className="gap-2" onClick={handleSignIn}>
      <GoogleIcon /> Sign in
    </Button>
  )

  /*
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button>Get Started</Button>
      </AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogContent className="bg-gray-100">
          <AlertDialogTitle className="text-center font-medium">
            Sign in
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            To use this app, please sign in
          </AlertDialogDescription>

          <Button
            className="absolute top-4 left-4"
            onClick={() => setIsOpen(false)}
          >
            <XIcon />
          </Button>

          <div className="space-x-4 text-center">
            <Button className="gap-2" onClick={handleSignIn}>
              <GoogleIcon /> Google
            </Button>
            <Button
              className="gap-2"
              onClick={() => alert('Feature coming soon!')}
            >
              <LinkedInIcon /> LinkedIn
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
    */
}
