const tokenService = require('db').services.tokens;

module.exports = async () => {
  const { results } = await tokenService.aggregate([]);

  return results;
};