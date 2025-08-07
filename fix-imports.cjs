const fs = require('fs');
const path = require('path');

// Function to recursively find all .tsx files
function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to remove version numbers from imports
function fixImports(content) {
  // Replace imports with version numbers
  const fixes = [
    { from: /@([0-9]+\.[0-9]+\.[0-9]+)/g, to: '' },
    { from: /jsr:@supabase\/supabase-js@[0-9.]+/g, to: '@supabase/supabase-js' },
    { from: /npm:@supabase\/supabase-js@[0-9.]+/g, to: '@supabase/supabase-js' },
  ];
  
  let fixedContent = content;
  fixes.forEach(fix => {
    fixedContent = fixedContent.replace(fix.from, fix.to);
  });
  
  return fixedContent;
}

// Main execution
const projectRoot = process.cwd();
const tsxFiles = findTsxFiles(projectRoot);

console.log(`Found ${tsxFiles.length} TypeScript files to process...`);

let fixedCount = 0;
tsxFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const fixedContent = fixImports(content);
  
  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log(`Fixed imports in: ${path.relative(projectRoot, filePath)}`);
    fixedCount++;
  }
});

console.log(`\nFixed imports in ${fixedCount} files.`);
