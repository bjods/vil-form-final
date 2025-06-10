import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the dist directory to find the actual built file names
const distDir = path.join(__dirname, '../dist');
const assetsDir = path.join(distDir, 'assets');

if (!fs.existsSync(assetsDir)) {
  console.error('Assets directory not found. Make sure to run this script after build.');
  process.exit(1);
}

// Find the main JS and CSS files
const files = fs.readdirSync(assetsDir);
const jsFile = files.find(file => file.startsWith('index-') && file.endsWith('.js'));
const cssFile = files.find(file => file.startsWith('index-') && file.endsWith('.css'));

if (!jsFile || !cssFile) {
  console.error('Could not find main JS or CSS files in assets directory.');
  console.log('Available files:', files);
  process.exit(1);
}

console.log('Found JS file:', jsFile);
console.log('Found CSS file:', cssFile);

// Read the embed.js template
const embedPath = path.join(__dirname, '../public/embed.js');
let embedContent = fs.readFileSync(embedPath, 'utf8');

// Replace the placeholder file names with actual file names
embedContent = embedContent.replace(
  /\/assets\/index-DQ-Hcp3-\.css/g,
  `/assets/${cssFile}`
);

embedContent = embedContent.replace(
  /\/assets\/index-BQz2Q8ng\.js/g,
  `/assets/${jsFile}`
);

// Write the updated embed.js to the dist directory
const distEmbedPath = path.join(distDir, 'embed.js');
fs.writeFileSync(distEmbedPath, embedContent);

console.log('Updated embed.js written to dist/embed.js');
console.log('WordPress sites can now include: <script src="YOUR_DOMAIN/embed.js"></script>'); 