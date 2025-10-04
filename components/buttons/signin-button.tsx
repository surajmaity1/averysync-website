'use client'

import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog'
import { XIcon } from 'lucide-react'
import { useState } from 'react'
import { GoogleIcon, LinkedInIcon } from '../icons/signin-button-icons'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogPortal,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { Button } from '../ui/button'

export const SignInButton = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleSignIn = () => {}

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
            className="absolute top-4 right-4"
            onClick={() => setIsOpen(false)}
          >
            <XIcon />
          </Button>

          <div className="space-x-4 text-center">
            <Button className="gap-2" onClick={handleSignIn}>
              <GoogleIcon /> Google
            </Button>
            <Button className="gap-2" onClick={handleSignIn}>
              <LinkedInIcon /> LinkedIn
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
