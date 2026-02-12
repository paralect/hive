import config from 'app-config';
import bullMq from './bullMq';
const queue = bullMq.Queue(`database-${config.env}`);

let handlers = {};

export default {
  on(eventName, handler) {
    console.log('registering', eventName);

    handlers[eventName] = handlers[eventName] || [];
    handlers[eventName].push(handler);
  },
  emit(eventName, data) {
    queue.add(eventName, data);
  }
};

bullMq.Worker(`database-${config.env}`, async ({ name: eventName, data }) => {
  await Promise.all((handlers[eventName] || []).map(h => h(data)));
});