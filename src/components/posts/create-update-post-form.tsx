import { POST_TYPE_ENUM, RECORDED_TYPE_ENUM } from '@/api/posts/posts.enum'
import { zodResolver } from '@hookform/resolvers/zod'
import { AudioLines } from 'lucide-react'
import { Controller, useForm, UseFormWatch } from 'react-hook-form'
import z from 'zod'
import { Button } from '../ui/button'
import { FormInput } from '../ui/form-input'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

const postFormSchema = z.object({
  postId: z.string().optional(),
  title: z
    .string()
    .nonempty('Title is required')
    .min(3, 'Min 3 chars required'),
  description: z.string().optional(),
  type: z.enum(POST_TYPE_ENUM),
  isRecorded: z.boolean().optional(),
})

export type TPostFormData = z.infer<typeof postFormSchema>

type CreateUpdatePostFormProps = {
  isSubmitting?: boolean
  mode?: 'create' | 'update'
  initialData?: Partial<TPostFormData>
  onCancel: () => void
  onSubmit: (data: TPostFormData) => void
}

type SubmitFormButtonProps = {
  text: string
  isDisabled?: boolean
  isLoading?: boolean
  watch: UseFormWatch<TPostFormData>
  errors: Record<string, any>
  isReactHookValidated: boolean
}

const SubmitFormButton = ({
  text,
  isDisabled,
  isLoading,
  watch,
  errors,
  isReactHookValidated,
}: SubmitFormButtonProps) => {
  const titleWatch = watch('title')
  const typeWatch = watch('type')

  const isButtonDisabled =
    !titleWatch ||
    !typeWatch ||
    !!errors.title ||
    !!errors.type ||
    isLoading ||
    isDisabled

  return (
    <Button
      type="submit"
      disabled={!isReactHookValidated || isButtonDisabled || isLoading}
      className={`${
        isButtonDisabled || isLoading ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      {text}
    </Button>
  )
}

export const CreateUpdatePostForm = ({
  isSubmitting,
  mode,
  initialData,
  onCancel,
  onSubmit,
}: CreateUpdatePostFormProps) => {
  const {
    register,
    control,
    watch,
    formState: { errors, isDirty, isValid },
    handleSubmit,
  } = useForm<TPostFormData>({
    resolver: zodResolver(postFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      type: initialData?.type || POST_TYPE_ENUM.POST,
      isRecorded: initialData?.isRecorded || false,
    },
  })

  const buttonText = mode === 'create' ? 'Post' : 'Update'
  const buttonLoadingText = mode === 'create' ? 'Posting...' : 'Updating...'
  const handleFormSubmit = (data: TPostFormData) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <FormInput
        required
        label="Title"
        htmlFor="title"
        direction="column"
        errorMessage={errors.title?.message}
      >
        <Input
          id="title"
          type="text"
          placeholder="Enter title"
          {...register('title')}
        />
      </FormInput>

      <FormInput
        label="Description"
        htmlFor="description"
        direction="column"
        errorMessage={errors.description?.message}
      >
        <Input
          id="description"
          placeholder="Enter description"
          className=""
          {...register('description')}
        />
      </FormInput>

      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <FormInput
            label="Type"
            icon={AudioLines}
            errorMessage={errors.type?.message}
          >
            <Select
              name={field.value}
              value={field.value}
              onValueChange={(value) => field.onChange(value as POST_TYPE_ENUM)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={POST_TYPE_ENUM.POST}>Post</SelectItem>
                <SelectItem value={POST_TYPE_ENUM.SPACE}>Space</SelectItem>
              </SelectContent>
            </Select>
          </FormInput>
        )}
      />

      <Controller
        control={control}
        name="isRecorded"
        render={({ field }) => (
          <FormInput
            label="Record space"
            icon={AudioLines}
            errorMessage={errors.isRecorded?.message}
          >
            <Select
              value={field.value ? 'YES' : 'NO'}
              onValueChange={(value) => field.onChange(value === 'YES')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Record space" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RECORDED_TYPE_ENUM.YES}>Yes</SelectItem>
                <SelectItem value={RECORDED_TYPE_ENUM.NO}>No</SelectItem>
              </SelectContent>
            </Select>
          </FormInput>
        )}
      />
      <div>
        {onCancel && <Button onClick={onCancel}>Close</Button>}
        <SubmitFormButton
          text={isSubmitting ? buttonLoadingText : buttonText}
          isDisabled={mode === 'update' ? !isDirty : false}
          isLoading={isSubmitting}
          watch={watch}
          errors={errors}
          isReactHookValidated={isValid}
        />
      </div>
    </form>
  )
}
