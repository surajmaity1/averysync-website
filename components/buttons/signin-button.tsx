'use client'

import { AlertDialogTrigger } from '@radix-ui/react-alert-dialog'
import { XIcon } from 'lucide-react'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
} from '../ui/alert-dialog'

export const SignInButton = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <div>Log in</div>
      </AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogTitle>Log in with Google</AlertDialogTitle>
          <AlertDialogDescription>Log in to get started</AlertDialogDescription>
          <button onClick={() => setIsOpen(false)}>
            <XIcon />
          </button>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}
