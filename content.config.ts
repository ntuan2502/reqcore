import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',
      schema: z.object({
        date: z.string(),
        author: z.string().optional(),
        image: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    }),
    features: defineCollection({
      type: 'page',
      source: 'features/**/*.md',
      schema: z.object({
        status: z.enum(['shipped', 'building', 'vision']).default('vision'),
        type: z.enum(['pillar', 'feature', 'idea']).default('feature'),
        order: z.number().default(0),
        tags: z.array(z.string()).optional(),
      }),
    }),
  },
})
