// prettier.config.ts, .prettierrc.ts, prettier.config.mts, or .prettierrc.mts

import { type Config } from 'prettier'

const config: Config = {
  trailingComma: 'all',
  tabWidth: 2,
  singleQuote: true,
  semi: false,
  useTabs: false,
  plugins: ['prettier-plugin-tailwindcss'],
}

export default config
