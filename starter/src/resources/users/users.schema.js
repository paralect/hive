import { z } from 'zod';

const users = z.object({
  _id: z.string(),
  createdOn: z.date(),
  updatedOn: z.date(),

  email: z.string().email(),
  fullName: z.string(),
  avatarUrl: z.string().url().optional(),

  password: z.string(),

  oauth: z.object({
    google: z.object({}),
  }).optional(),
});

export default users;
