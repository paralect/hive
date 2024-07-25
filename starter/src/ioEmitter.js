import config from "app-config";
import { Emitter } from "@socket.io/redis-emitter";
import { createClient } from "redis";
const redisClient = createClient({ url: config.redis.url });
const emitter = new Emitter(redisClient);
export default emitter;
