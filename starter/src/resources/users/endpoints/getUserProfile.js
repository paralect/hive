import { z } from 'zod';
import db from 'db';

const userService = db.services.users;

export const handler = async (ctx) => {
  const { userId } = ctx.params;
  const user = await userService.findOne({ _id: userId });
  ctx.body = user;
};

export const requestSchema = z.object({
  userId: z.string(),
});

export const endpoint = {
  method: "GET",
  url: "/profile/:userId",
};
