
export const handler = (ctx) => {
  ctx.body = 'Hello from Hive 👋';
  ctx.status = 200;
};

export const endpoint = {
  method: "get",
  url: "/",
};

export default {
  handler, endpoint
}
