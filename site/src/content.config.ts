import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
	i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				/** Section of the upstream English primer this page is based on. */
				original: z.url().optional(),
				/** Show the "mark as studied" toggle. Defaults to true for content pages. */
				trackable: z.boolean().optional(),
			}),
		}),
	}),
};
