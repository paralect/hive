import { z } from 'zod';

const schema = z.object({
  _id: z.string(),
  createdOn: z.date(),
  updatedOn: z.date(),
  version: z.number(),
});

export default schema;
