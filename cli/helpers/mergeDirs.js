
const fs = require('fs').promises;
const path = require('path');

function shouldIgnore(filePath) {
  const ignoredDirs = ['node_modules', 'dist', '.git'];
  return ignoredDirs.some(dir => filePath.includes(path.sep + dir + path.sep));
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (shouldIgnore(srcPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      console.log('copy', srcPath, destPath)
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function mergeDirectories(sourceDir1, sourceDir2, targetDir) {
  // First, copy all contents from sourceDir1 to targetDir
  await copyDir(sourceDir1, targetDir);

  // Then, copy and extend/overwrite with contents from sourceDir2
  await copyDir(sourceDir2, `${targetDir}/src`);
}

module.exports = async ({ hiveSrc, outDir }) => {
  await mergeDirectories(path.resolve(__dirname, './../../starter'), hiveSrc, outDir);

  console.log('Merged resources');
}