import { config, fields, collection } from '@keystatic/core'

const repo = process.env.KEYSTATIC_GITHUB_REPO ?? 'Aegis-Finance/aegis-garage'

const storage =
  process.env.KEYSTATIC_GITHUB_REPO && process.env.KEYSTATIC_GITHUB_CLIENT_ID
    ? {
        kind: 'github' as const,
        repo,
      }
    : {
        kind: 'local' as const,
      }

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
      path: 'content/articles/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
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
        draft: fields.checkbox({ label: 'Draft', defaultValue: false }),
        content: fields.markdoc({
          label: 'Body',
          options: {
            link: true,
          },
        }),
      },
    }),
  },
})
