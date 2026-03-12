import { endpoint, z, db } from '@hive';

const userService = db.services.users;

export default endpoint({
  method: 'get',
  url: '/profile/:userId',

  requestSchema: z.object({
    userId: z.string(),
  }),

  handler: async (ctx) => {
    const user = await userService.findOne({ _id: ctx.params.userId });
    ctx.body = user;
  },
});
