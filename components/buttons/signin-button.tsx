'use client'

import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle } from "../ui/alert-dialog"

export const SignInButton = () => {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <div>Log in</div>
      </AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogOverlay/>
        <AlertDialogContent>
          <AlertDialogTitle>Log in with Google</AlertDialogTitle>
          <AlertDialogDescription>Log in to get started</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  )
}