const Joi = require("joi");
const userService = require('db').services.users;

module.exports.handler = async (ctx) => {
  const user = await userService.findOne({ _id: ctx.state.user._id });
  ctx.body = user;
};

module.exports.middlewares = [require('middlewares/isAuthorized')];

module.exports.requestSchema = Joi.object({});

module.exports.endpoint = {
  method: "GET",
  url: "/me",
};
