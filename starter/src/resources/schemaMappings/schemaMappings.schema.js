import { z } from 'zod';
import dbSchema from 'helpers/schema/db.schema';

export default dbSchema.extend({
  mappings: z.object({}),
});