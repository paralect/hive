import _ from 'lodash';

export default (envs = []) => {
  let missingEnvs = [];
  
  _.each(envs, envName => {
    if (!process.env[envName]) {
      missingEnvs.push(envName);
    }
  });

  if (!_.isEmpty(missingEnvs)) {
    throw Error(`Missing env variables: ${missingEnvs.join(', ')}`)
  }
};