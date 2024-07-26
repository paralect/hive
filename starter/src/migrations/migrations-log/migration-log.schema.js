import { z } from 'zod';

const schema = z.object({
  _id: z.string(),
  createdOn: z.date(),
  updatedOn: z.date(),
  startTime: z.date(),
  finishTime: z.date().optional(),
  status: z.string(),
  error: z.string().optional(),
  errorStack: z.string().optional(),
  duration: z.string().optional(),
  migrationVersion: z.number(),
});

export default schema;
