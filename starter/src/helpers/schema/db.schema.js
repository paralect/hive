import { z } from 'zod';

export default z
  .object({
    _id: z.string(),

    createdOn: z.coerce.date().default(() => new Date()),
    updatedOn: z.coerce.date().default(() => new Date()),
  });