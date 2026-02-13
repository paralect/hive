export default {
  _hive: {
    authHeaderName: 'x-api-key',
  },

  webUrl: process.env.WEB_URL,

  cloudStorage: {
    endpoint: process.env.STORAGE_ENDPOINT,
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_SECRET,
    bucket: process.env.STORAGE_BUCKET
  },

  // google: {
  //   clientId: process.env.GOOGLE_CLIENT_ID,
  //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  // },
};