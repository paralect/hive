const fs = require("fs");
const List = require("prompt-list");

const config = require("./config");
const { execCommand } = require("./util");


const buildAndPushImage = async ({
  dockerFilePath,
  dockerRepo,
  dockerContextDir,
  imageTag,
  environment,
}) => {
  await execCommand(`docker build \
    --build-arg APP_ENV=${environment} \
    -f ${dockerFilePath} \
    -t ${dockerRepo} \
    ${dockerContextDir}`);
  await execCommand(`docker tag ${dockerRepo} ${imageTag}`);
  await execCommand(`docker push ${imageTag}`);
  await execCommand(`docker push ${dockerRepo}:latest`);
};

const pushToKubernetes = async ({ imageTag, appName, deployConfig }) => {
  const deployDir = `${config.rootDir}/deploy/api`;

  if (config.kubeConfig && !fs.existsSync(`${config.home}/.kube/config`)) {
    console.log("Creating kubeconfig");
    fs.mkdirSync(`${config.home}/.kube`);
    fs.writeFileSync(`${config.home}/.kube/config`, config.kubeConfig);
  }

  let projectId = process.env.PROJECT_ID || 'core';
  let attachedDomains;

  await execCommand(
    `helm upgrade --force --install projects-${projectId} ${deployDir} \
      --namespace apps --create-namespace  \
      --set containerRegistry=paralect/hive-api \
      --set service=hive-api-${projectId} \
      --set imagesVersion=${imageTag}  \
      --set domain={hive-api-${projectId}.paralect.co} \
      --set projectId=${projectId} \
      --set env\[0\].name=MONGODB_URI \
      --set env\[0\].value='${process.env.MONGODB_URI}' \
      -f ${deployDir}/staging.yaml   --timeout 35m`,
    {
      // cwd: `/app`,
    }
  );
};

const deploy = async () => {
  if (config.dockerRegistry.password) {
    await execCommand(
      `docker login --username ${config.dockerRegistry.username} --password ${config.dockerRegistry.password} registry.digitalocean.com`
    );
  }
  const deployConfig = config.deploy;

  let imageTag = config.dockerRegistry.imageTag;

  if (!imageTag) {
    const { stdout: branch } = await execCommand(
      "git rev-parse --abbrev-ref HEAD",
      { stdio: "pipe" }
    );
    const { stdout: commitSHA } = await execCommand("git rev-parse HEAD", {
      stdio: "pipe",
    });

    imageTag = `${branch}.${commitSHA}`;
  }

  try {
    await execCommand(
      "kubectl delete secrets sh.helm.release.v1.apps-staging-api.v1"
    );

    await execCommand(
      "kubectl delete secrets sh.helm.release.v1.apps-staging-api.v2"
    );
  } catch (err) {}

  // push api image to registry
  await buildAndPushImage({
    ...deployConfig,
    imageTag: `${deployConfig.dockerRepo}:${imageTag}`,
    environment: config.environment,
  });

  if (!process.env.SKIP_KUBERNETES) {
    // deploy api to kubernetes and deploy migrator through helm hooks
    await pushToKubernetes({
      imageTag,
      appName: "api",
      deployConfig,
    });
  }
};

deploy();

process.on("unhandledRejection", (error) => {
  console.error(error);
  process.exit(1);
});
