import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import * as React from 'react'

function AlertDialog ({...props}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
    return <AlertDialogPrimitive.Root data-slot='alert-dialog' {...props} />
}

function AlertDialogTrigger ({...props}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
    return <AlertDialogPrimitive.Trigger data-slot='alert-dialog-trigger' {...props} />
}

function AlertDialogPortal ({...props}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
    return <AlertDialogPrimitive.Portal data-slot='alert-dialog-portal' {...props} />
}

function AlertDialogOverlay ({...props}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
    return <AlertDialogPrimitive.Overlay data-slot='alert-dialog-overlay' {...props} />
}

function AlertDialogContent ({...props}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
    return <AlertDialogPrimitive.Content data-slot='alert-dialog-content' {...props} />
}

function AlertDialogTitle ({...props}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
    return <AlertDialogPrimitive.Title data-slot='alert-dialog-title' {...props} />
}

function AlertDialogDescription ({...props}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
    return <AlertDialogPrimitive.Description data-slot='alert-dialog-description' {...props} />
}

function AlertDialogCancel ({...props}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
    return <AlertDialogPrimitive.Cancel data-slot='alert-dialog-cancel' {...props} />
}

function AlertDialogAction ({...props}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
    return <AlertDialogPrimitive.Action data-slot='alert-dialog-action' {...props} />
}

export {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction
}

