import { z, dbSchema } from '@hive/schema';

export default dbSchema.extend({
  user: z.object({
    _id: z.string(),
  }),
  token: z.string(),
  otp: z.string().nullable().optional(),
  metadata: z.object({}).optional()
});
