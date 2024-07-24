const Joi = require("joi");

const users = Joi.object({
  _id: Joi.string(),
  createdOn: Joi.date(),
  updatedOn: Joi.date(),

  email: Joi.string().email().required(),
  username: Joi.string(),
  fullName: Joi.string(),
  avatarUrl: Joi.string().uri(),

  password: Joi.string(),

  oauth: Joi.object({
    google: Joi.object({}),
  }),
});

module.exports = users;
