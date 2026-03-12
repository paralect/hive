import { z, dbSchema } from '@hive/schema';

const users = dbSchema.extend({
  email: z.string().email(),
  fullName: z.string(),
  avatarUrl: z.string().url().optional(),

  password: z.string(),

  oauth: z.object({
    google: z.object({}),
  }).optional(),
});

export default users;
