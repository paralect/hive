const Joi = require('joi');

module.exports = Joi.object({
  _id: Joi.string(),
  createdOn: Joi.date(),
  updatedOn: Joi.date(),

  mappings: Joi.object(),
});