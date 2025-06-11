#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate asset manifest for embed
function generateEmbedManifest() {
  const distDir = path.join(__dirname, '..', 'dist');
  const assetsDir = path.join(distDir, 'assets');
  const embedDir = path.join(distDir, 'embed');
  
  const manifest = {
    mainApp: {
      js: null,
      css: null
    },
    embed: {
      js: null,
      css: null
    },
    timestamp: new Date().toISOString()
  };

  try {
    // Find main app assets
    if (fs.existsSync(assetsDir)) {
      const assetFiles = fs.readdirSync(assetsDir);
      
      // Find main JS file (index-*.js)
      const jsFile = assetFiles.find(file => 
        file.startsWith('index-') && file.endsWith('.js')
      );
      if (jsFile) {
        manifest.mainApp.js = `assets/${jsFile}`;
      }
      
      // Find main CSS file (index-*.css)
      const cssFile = assetFiles.find(file => 
        file.startsWith('index-') && file.endsWith('.css')
      );
      if (cssFile) {
        manifest.mainApp.css = `assets/${cssFile}`;
      }
    }

    // Find embed assets
    if (fs.existsSync(embedDir)) {
      const embedFiles = fs.readdirSync(embedDir);
      
      // Find embed JS file (embed.umd.cjs - the actual UMD build)
      const embedJsFile = embedFiles.find(file => 
        file.includes('embed') && (file.endsWith('.umd.cjs') || file.endsWith('.umd.js'))
      );
      if (embedJsFile) {
        manifest.embed.js = `embed/${embedJsFile}`;
      }
      
      // Find embed CSS file (style.css)
      const embedCssFile = embedFiles.find(file => 
        file.endsWith('.css') && file === 'style.css'
      );
      if (embedCssFile) {
        manifest.embed.css = `embed/${embedCssFile}`;
      }
    }

    // Write manifest file
    const manifestPath = path.join(distDir, 'asset-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log('✅ Asset manifest generated:', manifestPath);
    console.log('Manifest contents:', JSON.stringify(manifest, null, 2));
    
    return manifest;
  } catch (error) {
    console.error('❌ Failed to generate asset manifest:', error);
    throw error;
  }
}

// Generate the manifest
if (import.meta.url === `file://${process.argv[1]}`) {
  generateEmbedManifest();
}

export default generateEmbedManifest;