import { endpoint } from '@hive';
import isAuthorized from '@/middlewares/isAuthorized';

export default endpoint({
  method: 'get',
  url: '/me',
  middlewares: [isAuthorized],

  handler: async (ctx) => {
    ctx.body = ctx.state.user;
  },
});
