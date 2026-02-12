const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const mkdirp = require('mkdirp');

const execCommand = async (command, options = {}, outputFileSrc = null) => {
  let commandParts = command;

  if (typeof command === 'string') {
    commandParts = command
      .split(/ +(?=(?:(?:[^"]*"){2})*[^"]*$)/g)
      .map((commandPart) => {
        if (
          commandPart[0] === '"' &&
          commandPart[commandPart.length - 1] === '"'
        ) {
          return commandPart.replace(/["]+/g, '', '');
        }

        return commandPart;
      });
  }

  const commandName = commandParts.shift();
  const commandArguments = commandParts;

  const child = spawn(commandName, commandArguments, {
    stdio: outputFileSrc ? 'pipe' : 'inherit',
    ...options,
  });

  if (outputFileSrc) {
    const dir = path.dirname(outputFileSrc);
    await mkdirp(dir);
    child.stdout.pipe(fs.createWriteStream(outputFileSrc, { flags: 'a+' }));
  }

  return new Promise((resolve, reject) => {
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command "${command}" failed with exit code ${code}`));
    });
    child.on('error', reject);
  });
};

module.exports = execCommand;