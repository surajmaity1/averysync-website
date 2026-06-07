import { ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { PostForm, TPostFormData } from './create-update-post-form'

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
  mode: 'update'
  defaultData?: Partial<TPostFormData>
}

type PostDialogProps = CreateModeProps | UpdateModeProps

type DialogMode = PostDialogProps['mode']

const POST_DIALOG_TITLE_MODE: Record<DialogMode, string> = {
  create: 'Create Post / Space',
  update: 'Update Post / Space',
}

export const PostDialog = ({
  open,
  children,
  isMutationPending,
  onSubmit,
  onOpenChange,
  mode,
  defaultData,
}: PostDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="bg-gray-50">
        <AlertDialogTitle>{POST_DIALOG_TITLE_MODE[mode]}</AlertDialogTitle>
        <AlertDialogDescription></AlertDialogDescription>
        <PostForm
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
