import { endpoint } from '@hive';
import uploadFile from '@/middlewares/uploadFile';
import cloudStorageService from '@/services/cloudStorage';

export default endpoint({
  method: 'post',
  url: '/',
  middlewares: [uploadFile.single('file')],

  handler: async (ctx) => {
    const { file } = ctx.request;
    const fileName = `${Date.now()}-${file.originalname}`;

    const data = await cloudStorageService.uploadPublic(
      `hive/${ctx.state.user._id}/${fileName}`,
      file
    );

    let { Location: url } = data;

    ctx.body = {
      url,
    };
  },
});
