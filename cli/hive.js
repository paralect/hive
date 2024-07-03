#!/usr/bin/env node

const { program } = require('commander');

const path = require('path');
const isAuthorized = require('./helpers/isAuthorized');
const mergeDirs = require('./helpers/mergeDirs');
const execCommand = require('./helpers/execCommand');
const downloadDirectory = require('./helpers/downloadDirectory');
const axios = require('./helpers/axiosAuth');
const isProjectInit = require('./helpers/isProjectInit.js');

program
  .command('run [dirPath]')
  .description('Run Hive server')
  .action(async (dirPath = '.') => {
    try {
      process.env.HIVE_SRC = path.resolve(process.cwd(), dirPath);
      require('./../starter/src/app.js');
    } catch (error) {
      console.error('An error occurred:', error.message);
    }
  });

  program
  .command('deploy [imageTag]')
  .description('Build and deploy Hive project from local machine docker + helm')
  .action(async (imageTag) => {
    process.env.HIVE_SRC = path.resolve(process.cwd());
    
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

    console.log("Deploying Image Tag ", imageTag);

    try {
     await isAuthorized();
    const { projectId } = await isProjectInit();
    console.log('project id', projectId)
     const { isOk } = (
      await axios({ 
        // url: `http://localhost:3001/projects/${projectId}/deploy`,
        url: `projects/${projectId}/deploy`,
        method: 'post',
        data: {
          imageTag
        }
      })
      ).data;

      console.log('Deployed');
    } catch (error) {
      console.error('An error occurred:', error.message);
    }
  });

  program
  .command('build-local')
  .description('Build Hive project from local machine with docker')
  .action(async () => {
    try {
      let outDir = path.resolve(process.cwd(), './dist');
      await mergeDirs({ hiveSrc: path.resolve(process.cwd()), outDir });

      console.log('outDir',  path.resolve(outDir, `./deploy/script`))
      await execCommand(`npm install --prefix ${path.resolve(outDir, `./deploy/script`)}`);

      process.env.SKIP_KUBERNETES = true;
      await execCommand('node ./index.js', {
        cwd: path.resolve(outDir, `./deploy/script/src`)
      });
    } catch (error) {
      console.error('An error occurred:', error.message);
    }
  });

program
  .command('install <plugin>')
  .description('Installs Hive plugin')
  .action(async (plugin) => {
    try {
      const destDir = process.cwd();
      
      await downloadDirectory(plugin);
    } catch (error) {
      console.error('An error occurred:', error.message);
    }
  });

program
  .command('login')
  .description('Login into Hive Cloud')
  .action(async () => {
    if (process.env.HIVE_TOKEN) {
      const user = (await axios({ url: `users/me`, method: 'get' })).data;

      console.log(`Already logged in!`, user);
      
      return;
    }
   
  });

program
  .command('init')
  .description('Init Hive Project')
  .action(async () => {
    try {
      process.env.HIVE_SRC = path.resolve(process.cwd());

      await isAuthorized();
      await isProjectInit();
    } catch (error) {
      console.error('An error occurred:', error.message);
    }
  });

program
  .command('env-get <envName>')
  .description('Get env variable')
  .action(async (envName) => {
    try {
      process.env.HIVE_SRC = path.resolve(process.cwd());

      await isAuthorized();
      const { projectId } = await isProjectInit();

      const { value } = (await axios({ 
        method: 'post',
        url: `projects/${projectId}/get-env`,
        data: {
          name: envName
        }
      })).data;

      console.log(`${envName} value is ${value || '<empty>'}`)
    } catch (error) {
      console.error('An error occurred:', error.message);
    }
  });

  program
  .command('env-set <envName> <envValue>')
  .description('Set env variable')
  .action(async (envName, envValue) => {
    try {
      process.env.HIVE_SRC = path.resolve(process.cwd());

      await isAuthorized();
      const { projectId } = await isProjectInit();

      const { value } = (await axios({ 
        method: 'post',
        url: `projects/${projectId}/env`,
        data: {
          name: envName,
          value: envValue,
        }
      })).data;

      console.log(`Updated ${envName}`)
    } catch (error) {
      console.error('An error occurred:', error.message);
    }
  });


// program
//   .command('init [name]')
//   .description('Installs Hive plugin')
//   .action(async (plugin) => {
//     try {
//       const destDir = process.cwd();
      
//       await downloadDirectory(plugin);
//     } catch (error) {
//       console.error('An error occurred:', error.message);
//     }
//   });

program.parse(process.argv);