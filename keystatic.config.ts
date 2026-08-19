import { config, fields, collection } from '@keystatic/core'

// VPS production uses on-disk content/ (see README). GitHub-backed editing
// requires KEYSTATIC_STORAGE=github at build time plus a GitHub App — rebuild
// after switching. Local is the reliable default for garage.aegisprotocol.org.
const storageMode =
  process.env.KEYSTATIC_STORAGE ?? import.meta.env.KEYSTATIC_STORAGE ?? 'local'

const storage =
  storageMode === 'github'
    ? {
        kind: 'github' as const,
        repo: 'Aegis-Finance/aegis-garage' as const,
      }
    : { kind: 'local' as const }

export default config({
  storage,
  ui: {
    brand: { name: 'Aegis Garage' },
    navigation: {
      Content: ['articles', 'categories'],
    },
  },
  collections: {
    categories: collection({
      label: 'Categories',
      slugField: 'name',
      path: 'content/categories/*',
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        description: fields.text({
          label: 'Description',
          multiline: true,
        }),
      },
    }),
    articles: collection({
      label: 'Articles',
      slugField: 'title',
      path: 'content/articles/*/',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        kicker: fields.text({
          label: 'Kicker (optional)',
          description: 'Short subtitle shown directly under the title.',
        }),
        description: fields.text({
          label: 'Description',
          description: 'Short summary for cards and search.',
          multiline: true,
        }),
        publishDate: fields.date({ label: 'Publish date' }),
        category: fields.relationship({
          label: 'Category',
          collection: 'categories',
        }),
        heroImage: fields.image({
          label: 'Hero image (WebP recommended)',
          directory: 'public/images/articles',
          publicPath: '/images/articles/',
        }),
        featured: fields.checkbox({
          label: 'Featured',
          description: 'Show this article in the Featured section on the homepage.',
          defaultValue: false,
        }),
        draft: fields.checkbox({ label: 'Draft', defaultValue: false }),
        content: fields.markdoc({
          label: 'Body',
          options: {
            link: true,
            image: {
              directory: 'public/images/articles',
              publicPath: '/images/articles/',
            },
          },
        }),
      },
    }),
  },
})
