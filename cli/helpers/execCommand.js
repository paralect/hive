const fs = require('fs');
const path = require('path');

const execa = require('execa');
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

    // commandParts = command.split(' ').filter((part) => !!part.trim());
  }

  const commandName = commandParts.shift();
  const commandArguments = commandParts;

  const process = execa(commandName, commandArguments, {
    stdio: outputFileSrc ? 'pipe' : 'inherit',
    ...options,
  });

  if (outputFileSrc) {
    console.log('writing to outputFileSrc', outputFileSrc);
    const dir = path.dirname(outputFileSrc);

    await mkdirp(dir);
    console.log(dir, fs.existsSync(dir));

    process.stdout.pipe(fs.createWriteStream(outputFileSrc, { flags: 'a+' }));
  }

  return process;
};

module.exports = execCommand;