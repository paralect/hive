import Joi from "joi";
export const endpoint = {
    method: "put",
    url: "/trigger-scheduler-handler",
};
export const requestSchema = {
    name: Joi.string().required(),
};
export const handler = async (ctx) => {
    const { name } = ctx.validatedData;
    try {
        const data = await schedulerHandler.handler();
        ctx.body = {
            ok: true,
            data,
        };
    }
    catch (err) {
        ctx.body = {
            ok: false,
            err: err.message,
        };
    }
};
