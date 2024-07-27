import { z } from 'zod';
import dbSchema from 'helpers/schema/db.schema';

export default dbSchema.extend({
  startTime: z.date(),
  finishTime: z.date().optional(),
  status: z.string(),
  error: z.string().optional(),
  errorStack: z.string().optional(),
  duration: z.string().optional(),
  migrationVersion: z.number(),
});

