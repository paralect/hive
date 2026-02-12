import { z } from 'zod';
import dbSchema from 'common/schema/db.schema';

export default dbSchema.extend({
  mappings: z.object({}),
});