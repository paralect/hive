import { z } from 'zod';

export const endpoint = {
  method: "put",
  url: "/trigger-scheduler-handler",
};

export const requestSchema = z.object({
  name: z.string(),
});

export const handler = async (ctx) => {
  const { name } = ctx.validatedData;

  const schedulerHandler = await (import(`scheduler/handlers/${name}`)).default;

  try {
    const data = await schedulerHandler.handler();

    ctx.body = {
      ok: true,
      data,
    };
  } catch (err) {
    ctx.body = {
      ok: false,
      err: err.message,
    };
  }
};
