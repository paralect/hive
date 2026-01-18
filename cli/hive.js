#!/usr/bin/env node

const { program } = require('commander');

const path = require('path');
const inquirer = require('inquirer');
const mergeDirs = require('./helpers/mergeDirs');
const execCommand = require('./helpers/execCommand');
const downloadDirectory = require('./helpers/downloadDirectory');
const axios = require('axios');
const tsx = require('tsx/cjs/api');
const fs = require('fs');

program
  .command('init [projectName]')
  .description('Initialize a new Hive project')
  .action(async (projectName) => {
    try {
      let name = projectName;

      if (!name) {
        const answer = await inquirer.prompt([
          {
            type: 'input',
            name: 'projectName',
            message: 'Project name:',
            default: 'my-hive-app'
          }
        ]);
        name = answer.projectName;
      }

      const projectDir = path.resolve(process.cwd(), name);

      console.log(`\n🐝 Creating Hive project: ${name}\n`);

      await execCommand(`mkdir -p ${projectDir}/src/resources`);
      await execCommand(`mkdir -p ${projectDir}/src/middlewares`);
      await execCommand(`mkdir -p ${projectDir}/src/services`);
      await execCommand(`mkdir -p ${projectDir}/src/scheduler/handlers`);

      fs.writeFileSync(
        path.join(projectDir, 'package.json'),
        JSON.stringify({
          name,
          version: '1.0.0',
          scripts: {
            dev: 'hive run ./src',
            start: 'hive run ./src'
          },
          dependencies: {}
        }, null, 2)
      );

      fs.writeFileSync(
        path.join(projectDir, '.env'),
        `MONGO_URI=mongodb://localhost:27017/${name}\nPORT=3001\nNODE_ENV=development\n`
      );

      fs.writeFileSync(
        path.join(projectDir, '.gitignore'),
        `node_modules\n.hive\n.env\n`
      );

      await execCommand(`cp -r ${path.resolve(__dirname, '..')}/starter/.cursor ${projectDir}/`);

      console.log(`✅ Project created!\n`);
      console.log(`Next steps:\n`);
      console.log(`  cd ${name}`);
      console.log(`  hive run ./src\n`);
      console.log(`Start building with AI commands:`);
      console.log(`  add-resource tasks`);
      console.log(`  add-endpoint tasks post title, status\n`);
    } catch (error) {
      console.error('An error occurred:', error.message);
    }
  });

program
  .command('run [dirPath]')
  .description('Run Hive server')
  .action(async (dirPath = '.') => {
    try {
      process.env.HIVE_SRC = path.resolve(process.cwd(), dirPath);

      const hiveProjectDir = path.resolve(process.env.HIVE_SRC, `../.hive`);
      await execCommand(`mkdir -p ${hiveProjectDir}`);
      await execCommand(`cp -r ${path.resolve(__dirname, '..')}/starter/ ${hiveProjectDir}`);

      tsx.require(`${hiveProjectDir}/src/app.js`, __filename); // TSX doesn't work inside node_moduels
    } catch (error) {
      console.error('An error occurred:', error.message);
    }
  });

program
  .command('prepare [dirPath]')
  .description('Prepare Hive server')
  .action(async (dirPath = '.') => {
    try {
      process.env.HIVE_SRC = path.resolve(process.cwd(), dirPath);
      const hiveProjectDir = path.resolve(process.env.HIVE_SRC, `../.hive`);

      await execCommand(`mkdir -p ${hiveProjectDir}`);
      await execCommand(`cp -r ${path.resolve(__dirname, '..')}/starter/. ${hiveProjectDir}`);
    } catch (error) {
      console.error('An error occurred:', error.message);
    }
  });

program
  .command('deploy')
  .description('Build hive project')
  .action(async () => {
    try {
      let outDir = path.resolve(process.cwd(), './dist');
      await mergeDirs({ hiveSrc: path.resolve(process.cwd()), outDir });

      console.log('outDir', path.resolve(outDir, `./deploy/script`))
      await execCommand(`npm install --prefix ${path.resolve(outDir, `./deploy/script`)}`);

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
      const user = (await axios({
        url: `https://hive-api-test.paralect.co/users/me`, method: 'get', headers: {
          'Authorization': `Bearer ${process.env.HIVE_TOKEN}`
        }
      })).data;

      console.log(`Already logged in!`, user);

      return;
    }

    const { email } = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Please enter your email:'
      }
    ]);

    try {
      await axios({ url: `https://hive-api-test.paralect.co/auth/login-code`, method: 'post', data: { email } });

      const { code } = await inquirer.prompt([
        {
          type: 'input',
          name: 'code',
          message: `One time code (sent to ${email})`,
        }
      ]);

      const { token, user } = (await axios({ url: `https://hive-api-test.paralect.co/auth/verify-login`, method: 'post', data: { email, code } })).data;

      console.log(`
        You're now logged into Hive! Welcome 🐝
        
        Important: to save access add HIVE_TOKEN to your env variables and your ~/.zshrc file

        export HIVE_TOKEN=${token}`)
    } catch (error) {
      console.error('An error occurred:', error.message);
    }
  });

program.parse(process.argv);