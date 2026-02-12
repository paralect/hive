import { z, dbSchema } from '@hive/schema';

const schema = dbSchema.extend({
  url: z.coerce.string().nullable(),

  user: z
    .object({
      _id: z.string(),
    })
    .passthrough()
    .nullable()
    .optional(),

  name: z.coerce.string().nullable().optional(),
  description: z.coerce.string().nullable().optional(),
});

export default schema;

export const secureFields = [];