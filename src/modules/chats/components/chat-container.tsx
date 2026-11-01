import { PromptForm } from '@/components/prompts/prompt-form'
import { useState } from 'react'

export const ChatContainer = () => {
  const [submitPrompt, setSubmitPrompt] = useState(false)

  const handlePromptSubmit = () => {}
  const handlePromptCancel = () => {}
  return (
    <PromptForm
      disabled={false}
      mode="create"
      onSubmit={handlePromptSubmit}
      onCancel={handlePromptCancel}
      isSubmitting={submitPrompt}
    />
  )
}
