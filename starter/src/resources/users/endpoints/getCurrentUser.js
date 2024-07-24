const Joi = require("joi");

module.exports.handler = async (ctx) => {
  ctx.body = ctx.state.user;
};

module.exports.middlewares = [require('middlewares/isAuthorized')];

module.exports.requestSchema = Joi.object({});

module.exports.endpoint = {
  method: "GET",
  url: "/me",
};
