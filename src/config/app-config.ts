import z from 'zod'

const applicationConfigSchema = z.object({
  applicationName: z.string().min(3, { error: 'Application name required' }),
  applicationDescription: z
    .string()
    .min(3, { error: 'Application description required' }),
  backendApplicationURL: z
    .string()
    .min(3, { error: 'Backend Application URL required' }),
  isDev: z.boolean(),
})

type TApplicationConfig = z.infer<typeof applicationConfigSchema>

export const applicationConfig: TApplicationConfig = {
  applicationName: 'Averysync',
  applicationDescription: 'Connect with friends',
  backendApplicationURL: import.meta.env.VITE_BACKEND_API_URL,
  isDev: import.meta.env.DEV,
}

export const validateApplicationConfig = (config: TApplicationConfig) => {
  const result = applicationConfigSchema.safeParse(config)

  if (!result.success) {
    console.log(
      'Application configuration error: ',
      z.treeifyError(result.error).properties,
    )
    throw new Error('Invalid Application configuration')
  }

  return result.data
}
