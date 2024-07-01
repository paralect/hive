const Joi = require("joi");

const users = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  bio: Joi.string(),
  avatarUrl: Joi.string().uri(),
  _id: Joi.string(),
  createdOn: Joi.date(),
  updatedOn: Joi.date(),
});

module.exports = users;
