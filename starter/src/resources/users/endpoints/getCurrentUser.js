import Joi from "joi";
import db from "db";
import isAuthorized from "middlewares/isAuthorized";
const userService = db.services.users;
export const handler = async (ctx) => {
  const user = await userService.findOne({ _id: ctx.state.user._id });
  ctx.body = user;
};
export const middlewares = [isAuthorized];
export const requestSchema = Joi.object({});
export const endpoint = {
  method: "GET",
  url: "/me",
};
