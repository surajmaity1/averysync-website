import { ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { CreateUpdatePostForm, TPostFormData } from './create-update-post-form'

type BaseProps = {
  open: boolean
  children: ReactNode
  isMutationPending?: boolean
  onSubmit: (data: TPostFormData) => void
  onOpenChange: (open: boolean) => void
}

type CreateModeProps = BaseProps & {
  mode: 'create'
  defaultData?: Partial<TPostFormData>
}

type UpdateModeProps = BaseProps & {
  mode: 'create'
  defaultData?: Partial<TPostFormData>
}

type CreateUpdatePostDialogProps = CreateModeProps | UpdateModeProps

export const CreatedUpdatePostDialog = ({
  open,
  children,
  isMutationPending,
  onSubmit,
  onOpenChange,
  mode,
  defaultData,
}: CreateUpdatePostDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="bg-gray-50">
        <AlertDialogTitle>
          {mode === 'create' ? 'Create Post / Space' : 'Update Post / Space'}
        </AlertDialogTitle>
        <AlertDialogDescription></AlertDialogDescription>
        <CreateUpdatePostForm
          isSubmitting={isMutationPending}
          mode={mode}
          initialData={defaultData}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </AlertDialogContent>
    </AlertDialog>
  )
}
