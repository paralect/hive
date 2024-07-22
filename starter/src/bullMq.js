const config = require('app-config');

const { Queue, Worker } = require('bullmq');

let connectionOpts = {
  host: config.redis.url.split('@')[1].split(':')[0],
  port: config.redis.url.split('@')[1].split(':')[1],
  username: 'default',
  password: config.redis.url.split(':')[2].split('@')[0],
};

module.exports = {
  Queue(queueName) {
    return new Queue(queueName, {
      connection: connectionOpts,
    });
  },
  Worker(queueName, workerFn, options = {}) {
    return new Worker(queueName, workerFn, {
      ...options,
      connection: connectionOpts,
    });
  },
};
