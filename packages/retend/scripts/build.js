import fs from 'node:fs';
import { execSync } from 'node:child_process';

if (fs.existsSync('dist')) {
  console.log('Removing dist directory...');
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('Done!');
}

fs.mkdirSync('dist');

// Copy the source directories to the dist directory.
console.log('Copying directories to dist...');
for (const dir of fs.readdirSync('source')) {
  fs.cpSync(`source/${dir}`, `dist/${dir}`, { recursive: true });
}
console.log('Done!');

console.log('Building types...');
execSync('bunx tsc --project tsconfig.json', { stdio: 'inherit' });

// For the jsx-runtime directory,
// we need to replace the .d.ts generated by Typescript for the index.js file,
// with the .d.ts file containing the JSX namespace.
console.log('Fixing jsx-runtime types...');
const jsxRuntimeDir = 'dist/jsx-runtime';

const jsxRuntimeTargetDtsFile = `${jsxRuntimeDir}/index.d.ts`;
const jsxRuntimeSourceDtsFile = 'source/jsx-runtime/index.d.ts';
const jsxRuntimeDtsContent = fs.readFileSync(jsxRuntimeSourceDtsFile, 'utf-8');
fs.writeFileSync(jsxRuntimeTargetDtsFile, jsxRuntimeDtsContent);

const jsxRuntimeDtsMapFile = `${jsxRuntimeDir}/index.d.ts.map`;
fs.unlinkSync(jsxRuntimeDtsMapFile);
console.log('Done!');
