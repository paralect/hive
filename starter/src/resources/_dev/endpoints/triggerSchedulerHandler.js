const Joi = require("joi");

module.exports.endpoint = {
  method: "put",
  url: "/trigger-scheduler-handler",
};

module.exports.requestSchema = {
  name: Joi.string().required(),
};

module.exports.handler = async (ctx) => {
  const { name } = ctx.validatedData;

  const schedulerHandler = require(`scheduler/handlers/${name}`);

  try {
    const data = await schedulerHandler.handler();

    ctx.body = {
      ok: true,
      data,
    };
  } catch (err) {
    ctx.body = {
      ok: false,
      err: err.message,
    };
  }
};
