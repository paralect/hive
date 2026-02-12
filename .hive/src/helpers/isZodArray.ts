import { ZodArray } from 'zod';

const isZodArray = (schema) => {
  if (schema instanceof ZodArray) return true;

  if (schema._def?.innerType) {
    return isZodArray(schema._def.innerType);
  }

  return false;
};

export default isZodArray;