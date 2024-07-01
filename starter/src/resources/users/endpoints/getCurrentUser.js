module.exports.handler = async (ctx) => {
  const user = await userService.findOne({ _id: ctx.state.user._id });
  ctx.body = user;
};

const Joi = require("joi");

module.exports.requestSchema = Joi.object({});

module.exports.endpoint = {
  method: "GET",
  url: "/me",
};
