const axios = require('axios');
const inquirer = require('inquirer');

module.exports = async () => {
  if (!process.env.HIVE_TOKEN) {
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

      process.env.HIVE_TOKEN = token;
      console.log(`
        You're now logged into Hive! Welcome 🐝
        
        Important: to save access add HIVE_TOKEN to your env variables and your ~/.zshrc file

        export HIVE_TOKEN=${token}

`);

      return { token, user }; 
    } catch (error) {
      console.error('An error occurred:', error.message);
    }
  } else {
    return { token: process.env.HIVE_TOKEN };
  }
}