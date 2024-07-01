const config = require("config");

const { Emitter } = require("@socket.io/redis-emitter");
const { createClient } = require("redis");

const redisClient = createClient({ url: config.redis.url });

const emitter = new Emitter(redisClient);

module.exports = emitter;
