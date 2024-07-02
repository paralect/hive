const _ = require('lodash');

module.exports = (envs = []) => {
  let missingEnvs = [];
  
  _.each(envs, envName => {
    if (!process.env[envName]) {
      missingEnvs.push(envName);
    }
  });

  if (!_.isEmpty(missingEnvs)) {
    throw Error(`Missing env variables: ${missingEnvs.join(', ')}`)
  }
}