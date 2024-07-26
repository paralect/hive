import { z } from 'zod';
import isAuthorized from 'middlewares/isAuthorized';

export const handler = async (ctx) => {
  ctx.body = ctx.state.user;
};

export const middlewares = [isAuthorized];
export const requestSchema = z.object({});

export const endpoint = {
  method: "GET",
  url: "/me",
};
