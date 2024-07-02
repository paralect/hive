const path = require("path");
const rootDir = path.resolve(__dirname, "./../../../");

const ENV = process.env;

const config = {
  rootDir,

  environment: ENV.ENVIRONMENT || "staging",

  namespace: ENV.NAMESPACE || "staging",

  kubeConfig: ENV.KUBE_CONFIG,

  home: ENV.HOME,

  dockerRegistry: {
    name: "paralect/hive-api",
    username: ENV.DOCKER_AUTH_USERNAME,
    password: ENV.DOCKER_AUTH_PASSWORD,

    imageTag: ENV.IMAGE_TAG,
  },
};

const deployConfig = {
  dockerRepo: `${config.dockerRegistry.name}`,
  dir: `${rootDir}`,
  folder: "",
  dockerFilePath: `${rootDir}/Dockerfile`,
  dockerContextDir: rootDir
};

// Object.keys(deployConfig).forEach((serviceName) => {
//   if (!deployConfig[serviceName].dockerFilePath) {
//     deployConfig[
//       serviceName
//     ].dockerFilePath = `${deployConfig[serviceName].dir}/Dockerfile`;
//   }

//   if (!deployConfig[serviceName].dockerContextDir) {
//     deployConfig[serviceName].dockerContextDir = deployConfig[serviceName].dir;
//   }
// });

config.deploy = deployConfig;

module.exports = config;
