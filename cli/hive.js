#!/usr/bin/env node

const { program } = require('commander');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const GITHUB_API_URL = 'https://api.github.com/repos';

async function fetchDirectoryTree(owner, repo, dirPath) {
  const url = `${GITHUB_API_URL}/${owner}/${repo}/contents/${dirPath}`;
  const response = await axios.get(url);
  return response.data;
}

async function downloadFile(fileUrl, filePath) {
  const response = await axios({
    url: fileUrl,
    method: 'GET',
    responseType: 'stream'
  });
  await fs.ensureDir(path.dirname(filePath));
  response.data.pipe(fs.createWriteStream(filePath));
  return new Promise((resolve, reject) => {
    response.data.on('end', resolve);
    response.data.on('error', reject);
  });
}

async function downloadDirectory(owner, repo, dirPath, destDir) {
  const tree = await fetchDirectoryTree(owner, repo, dirPath);
  for (const item of tree) {
    const filePath = path.join(destDir, path.relative(dirPath, item.path));
    if (item.type === 'file') {
      console.log(`Downloading ${item.path}...`);
      await downloadFile(item.download_url, filePath);
    } else if (item.type === 'dir') {
      await downloadDirectory(owner, repo, item.path, destDir);
    }
  }
}

const owner = 'paralect';
const repo = 'hive-plugins';

program
  .command('install <plugin>')
  .description('Installs Hive plugin')
  .action(async (plugin) => {
    try {
      const destDir = process.cwd();
      await downloadDirectory(owner, repo, directory, destDir);
      console.log('Initialization complete!');
    } catch (error) {
      console.error('An error occurred:', error.message);
    }
  });

program.parse(process.argv);