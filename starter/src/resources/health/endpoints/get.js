const handler = (ctx) => {
  ctx.status = 200;
};

module.exports.handler = handler;

module.exports.endpoint = {
  method: "get",
  url: "/",
};
