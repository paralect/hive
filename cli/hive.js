#!/usr/bin/env node

const { program } = require('commander');

const path = require('path');
const inquirer = require('inquirer');
const mergeDirs = require('./helpers/mergeDirs');
const execCommand = require('./helpers/execCommand');
const downloadDirectory = require('./helpers/downloadDirectory');
const axios = require('axios');

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
  .command('deploy')
  .description('Build hive project')
  .action(async () => {
    try {
      let outDir = path.resolve(process.cwd(), './dist');
      await mergeDirs({ hiveSrc: path.resolve(process.cwd()), outDir });

      console.log('outDir',  path.resolve(outDir, `./deploy/script`))
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
      const user = (await axios({ url: `https://hive-api-test.paralect.co/users/me`, method: 'get', headers: {
        'Authorization': `Bearer ${process.env.HIVE_TOKEN}`
      } })).data;

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