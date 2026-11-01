import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, UseFormWatch } from 'react-hook-form'
import z from 'zod'
import { Button } from '../ui/button'
import { FormInput } from '../ui/form-input'
import { Textarea } from '../ui/textarea'

const promptFormSchema = z.object({
  prompt: z.string().min(2, 'Prompt is required'),
})

type TPromptFormData = z.infer<typeof promptFormSchema>

type SubmitButtonProps = {
  text: string
  isLoading: boolean
  disabled: boolean
  watch: UseFormWatch<TPromptFormData>
}

export const SubmitButton = ({
  text,
  isLoading,
  disabled,
  watch,
}: SubmitButtonProps) => {
  const prompt = watch('prompt')
  const buttonDisabled = !prompt || isLoading || disabled

  return (
    <Button type="submit" disabled={buttonDisabled}>
      {text}
    </Button>
  )
}

type BaseFormProps = {
  mode?: 'view' | 'create'
  disabled: boolean
  initialData?: Partial<TPromptFormData>
  onCancel: () => void
}

type CreateEditPromptFormProps = BaseFormProps & {
  disabled: false
  isSubmitting: boolean
  onSubmit: (data: TPromptFormData) => void
}

type ViewPromptFormProps = BaseFormProps & {
  disabled: true
  isSubmitting: undefined
  onSubmit: undefined
}

type PromptFormProps = CreateEditPromptFormProps | ViewPromptFormProps

export const PromptForm = ({ initialData, mode }: PromptFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TPromptFormData>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      prompt: initialData?.prompt || '',
    },
  })

  const isSubmitting = mode === 'create'
  const handlePromptSubmit = () => {}

  return (
    <form onSubmit={handleSubmit(handlePromptSubmit)}>
      <FormInput
        required
        label="Prompt"
        htmlFor="prompt"
        errorMessage={errors.prompt?.message}
      >
        <Textarea id="prompt" placeholder="Ask anything!" />
      </FormInput>
      <SubmitButton watch={watch} text={'Send'} isLoading={} />
    </form>
  )
}
