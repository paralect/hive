import Joi from "joi";
export default Joi.object({
  _id: Joi.string(),
  createdOn: Joi.date(),
  updatedOn: Joi.date(),
  user: Joi.object({
    _id: Joi.string(),
  }).required(),
  token: Joi.string().required(),
  otp: Joi.string().allow(null).allow(""),
});
