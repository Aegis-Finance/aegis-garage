import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import markdoc from '@astrojs/markdoc'
import tailwind from '@astrojs/tailwind'
import keystatic from '@keystatic/astro'
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  site: 'https://garage.aegisprotocol.org',
  output: 'server',
  adapter: cloudflare({ imageService: 'compile' }),
  integrations: [react(), markdoc(), tailwind(), keystatic()],
  vite: {
    ssr: {
      external: ['js-yaml', 'marked'],
    },
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
})
