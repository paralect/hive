import Joi from "joi";
export default Joi.object({
  _id: Joi.string(),
  createdOn: Joi.date(),
  updatedOn: Joi.date(),
  mappings: Joi.object(),
});
