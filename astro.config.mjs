import { defineConfig, envField } from 'astro/config'
import react from '@astrojs/react'
import markdoc from '@astrojs/markdoc'
import tailwind from '@astrojs/tailwind'
import keystatic from '@keystatic/astro'
import node from '@astrojs/node'

export default defineConfig({
  site: 'https://garage.aegisprotocol.org',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react(), markdoc(), tailwind(), keystatic()],
  server: {
    allowedHosts: ['garage.aegisprotocol.org', 'origin-garage.aegisprotocol.org'],
  },
  security: {
    allowedDomains: [
      { hostname: 'garage.aegisprotocol.org', protocol: 'https' },
      { hostname: 'origin-garage.aegisprotocol.org', protocol: 'http' },
    ],
  },
  env: {
    schema: {
      KEYSTATIC_GITHUB_CLIENT_ID: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      KEYSTATIC_GITHUB_CLIENT_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      KEYSTATIC_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      HOST: envField.string({
        context: 'server',
        access: 'public',
        default: '0.0.0.0',
      }),
      PORT: envField.number({
        context: 'server',
        access: 'public',
        default: 4321,
      }),
    },
  },
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
