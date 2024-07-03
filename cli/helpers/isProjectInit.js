const fs = require('fs');
const path = require('path');
const axios = require('./axiosAuth');
const inquirer = require('inquirer');

module.exports = async () => {
  if (!process.env.PROJECT_ID) {
    let projectConfigPath = path.resolve(process.env.HIVE_SRC, './hive.config.js');
    
    if (fs.existsSync(projectConfigPath)) {
      const config = require(projectConfigPath);
      if (config.projectId) {
        process.env.PROJECT_ID = config.projectId;
      }
    } else {
      const projectPackageJsonPath = path.resolve(process.env.HIVE_SRC, './package.json');
      
      let projectName;

      if (fs.existsSync(projectPackageJsonPath)) {
        const { name } = require(projectPackageJsonPath);
        projectName = name;
      } else {
        const { name } = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Project Name'
          }
        ]);

        projectName = name;

        fs.writeFileSync(projectPackageJsonPath, `${JSON.stringify({
          name: name,

          scripts: {
            "dev": "nodemon --watch . --exec hive run .",
            "deploy-local": "hive build-local && hive deploy",
          },

          dependencies: {
            "@paralect/hive": "^0.0.9"
          },
          devDependencies: {
            "nodemon": "^3.1.4"
          }
        }, null, 2)}`);
      }
 
      const project = (await axios({ url: `projects`, method: 'post', data: { name: projectName } })).data;

      fs.writeFileSync(projectConfigPath, `module.exports = { projectId: '${project._id}' } `);

      const projectEnvPath = path.resolve(process.env.HIVE_SRC, './app-config/.env');

      if (project?.envs?.staging) {
        if (!fs.existsSync(path.resolve(process.env.HIVE_SRC, './app-config'))) {
          fs.mkdirSync(path.resolve(process.env.HIVE_SRC, './app-config'));
        }

        fs.writeFileSync(projectEnvPath, Object.keys(project.envs.staging).map(key => `${key}=${project.envs.staging[key]}`).join('\n'));
      }

      console.log(`Successfully initialised project ${projectName}!
To launch the dev server run:
npm install
npm run dev
        `);

      process.env.PROJECT_ID = project._id;
    }
  }
  
  return { projectId: process.env.PROJECT_ID };
}