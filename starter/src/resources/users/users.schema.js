import { z } from 'zod';
import dbSchema from 'helpers/schema/db.schema';

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
