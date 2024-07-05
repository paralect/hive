const axios = require('axios');

module.exports = (options) => {
  return axios({
    ...options,
    url: options.url.startsWith('http') ? options.url : `https://hive-api-core.paralect.co/${options.url}`,
    // url: options.url.startsWith('http') ? options.url : `http://localhost:3001/${options.url}`,
    headers: { 
      ...(options?.headers || {}),
      ...(process.env.HIVE_TOKEN ? { Authorization: `Bearer ${process.env.HIVE_TOKEN}` } : {})}
  })
}