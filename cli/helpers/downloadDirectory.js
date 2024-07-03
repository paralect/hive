const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');

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

async function downloadDirectory(pluginName, baseDir = '') {
  const owner = 'paralect';
  const repo = 'hive-plugins';

  const destDir = path.join(process.cwd(), baseDir);

  const tree = await fetchDirectoryTree(owner, repo, pluginName);
  for (const item of tree) {
    const relativePath = path.relative(pluginName, item.path);
    const filePath = path.join(destDir, relativePath);
    if (item.type === 'file') {
      console.log(`Downloading ${item.path}...`);
      await downloadFile(item.download_url, filePath);
    } else if (item.type === 'dir') {
      await downloadDirectory(item.path, path.join(baseDir, relativePath));
    }
  }
}

module.exports = downloadDirectory;