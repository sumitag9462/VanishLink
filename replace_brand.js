const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname);

function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file is text/utf8. Basic heuristic: doesn't contain null bytes
    if (content.indexOf('\0') !== -1) return;

    let originalContent = content;

    // Ordered from most specific to least specific to avoid partial replacements
    content = content.replace(/DEADMAN-LINK/g, 'VANISHLINK');
    content = content.replace(/deadman-link/g, 'vanishlink');
    content = content.replace(/Deadman-Link/g, 'VanishLink');
    content = content.replace(/Deadman Link/g, 'VanishLink');
    content = content.replace(/DEADMAN/g, 'VANISHLINK');
    content = content.replace(/Deadman/g, 'Vanish');
    content = content.replace(/deadman/g, 'vanish');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Replaced in: ${filePath}`);
    }
  } catch (err) {
    // Ignore errors for binary files, directories, etc.
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    
    // Skip node_modules, .git, .gemini, dist, and this script
    if (
      fullPath.includes('node_modules') || 
      fullPath.includes('.git') || 
      fullPath.includes('.gemini') || 
      fullPath.includes('dist') || 
      fullPath.endsWith('replace_brand.js')
    ) {
      continue;
    }

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else {
      replaceInFile(fullPath);
    }
  }
}

walkDir(directoryPath);
console.log('Global replace completed.');
