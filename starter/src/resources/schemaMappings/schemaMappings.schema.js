import { z } from 'zod';

export default z.object({
  _id: z.string(),
  createdOn: z.date(),
  updatedOn: z.date(),

  mappings: z.object(),
});