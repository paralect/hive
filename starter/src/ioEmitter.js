import config from "app-config";
import redisEmitter from "@socket.io/redis-emitter";
import redis from "redis";
const { Emitter } = redisEmitter;
const { createClient } = redis;
const redisClient = createClient({ url: config.redis.url });
const emitter = new Emitter(redisClient);
export default emitter;
