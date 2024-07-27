import { z } from 'zod';

export default z
  .object({
    _id: z.string(),

    createdOn: z.coerce.date(),
    updatedOn: z.coerce.date(),
  })
  .strict();