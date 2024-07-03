
const fs = require('fs');
const path = require('path');

function shouldIgnore(filePath) {
  const ignoredDirs = ['node_modules', 'dist', '.git'];
  return ignoredDirs.some(dir => filePath.includes(path.sep + dir + path.sep));
}

async function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

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
      await fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function copyRootFiles(sourceDir, destDir) {
  try {
    // Read all items in the source directory
    const items = await fs.promises.readdir(sourceDir, { withFileTypes: true });

    // Ensure the destination directory exists
    await fs.promises.mkdir(destDir, { recursive: true });

    // Iterate over each item
    for (const item of items) {
      const sourcePath = path.join(sourceDir, item.name);
      const destPath = path.join(destDir, item.name);

      // Check if the item is a file and not package.json
      if (item.isFile() && item.name !== 'package.json') {
        // Copy the file to the destination directory
        await fs.promises.copyFile(sourcePath, destPath);
        console.log(`Copied: ${sourcePath} -> ${destPath}`);
      }
    }

    console.log('Files copied successfully.');
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

async function mergeDirectories(sourceDir1, sourceDir2, targetDir) {
  // First, copy all contents from sourceDir1 to targetDir
  await copyDir(sourceDir1, targetDir);

  // Then, copy and extend/overwrite with contents from sourceDir2
  await copyDir(sourceDir2, `${targetDir}/src`);
  await copyRootFiles(sourceDir2, targetDir);
}

module.exports = async ({ hiveSrc, outDir }) => {
  await mergeDirectories(path.resolve(__dirname, './../../starter'), hiveSrc, outDir);

  console.log('Merged resources');
}