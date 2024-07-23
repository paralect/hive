import Joi from "joi";
import db from "db";
const userService = db.services.users;
export const handler = async (ctx) => {
  const { userId } = ctx.params;
  const user = await userService.findOne({ _id: userId });
  ctx.body = user;
};
export const requestSchema = Joi.object({
  userId: Joi.string().required(),
});
export const endpoint = {
  method: "GET",
  url: "/profile/:userId",
};
