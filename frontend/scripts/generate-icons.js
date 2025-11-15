#!/usr/bin/env node

/**
 * PWA Icon Generator
 * Generates all required PWA icons from SVG logo
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Icon configurations
const icons = [
  // PWA Icons
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },

  // Apple Touch Icon
  { name: 'apple-touch-icon.png', size: 180 },

  // Favicons
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon.ico', size: 32 }, // Will be converted to ICO separately
];

// Screenshot placeholders (for PWA manifest)
const screenshots = [
  { name: 'screenshot-wide.png', width: 1280, height: 720 },
  { name: 'screenshot-narrow.png', width: 750, height: 1334 },
];

const publicDir = path.join(__dirname, '../public');
const logoPath = path.join(publicDir, 'logo.svg');

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  // Check if logo exists
  if (!fs.existsSync(logoPath)) {
    console.error('❌ Error: logo.svg not found in public folder');
    process.exit(1);
  }

  // Create public directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Generate each icon
  for (const icon of icons) {
    try {
      const outputPath = path.join(publicDir, icon.name);

      await sharp(logoPath)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 147, g: 51, b: 234, alpha: 1 }, // #9333ea
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${icon.name}:`, error.message);
    }
  }

  // Generate Open Graph image (social sharing)
  try {
    const ogPath = path.join(publicDir, 'og-image.png');

    // Create OG image with text
    const svgOG = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#9333ea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="1200" height="630" fill="url(#grad)"/>
        <text x="600" y="280" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">
          Caption Generator
        </text>
        <text x="600" y="350" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle" opacity="0.9">
          Générateur IA de Légendes Instagram
        </text>
        <text x="600" y="420" font-family="Arial, sans-serif" font-size="28" fill="white" text-anchor="middle" opacity="0.8">
          GPT-4 Vision • Claude 3.5 • Multi-langues
        </text>
      </svg>
    `;

    await sharp(Buffer.from(svgOG))
      .png()
      .toFile(ogPath);

    console.log(`✓ Generated og-image.png (1200x630)`);
  } catch (error) {
    console.error('✗ Failed to generate og-image.png:', error.message);
  }

  // Generate screenshot placeholders
  for (const screenshot of screenshots) {
    try {
      const outputPath = path.join(publicDir, screenshot.name);

      const svgScreenshot = `
        <svg width="${screenshot.width}" height="${screenshot.height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad${screenshot.name}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#f3e8ff;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#e0e7ff;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="${screenshot.width}" height="${screenshot.height}" fill="url(#grad${screenshot.name})"/>
          <text x="${screenshot.width / 2}" y="${screenshot.height / 2}" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#9333ea" text-anchor="middle">
            Caption Generator
          </text>
          <text x="${screenshot.width / 2}" y="${screenshot.height / 2 + 60}" font-family="Arial, sans-serif" font-size="24" fill="#6b7280" text-anchor="middle">
            Screenshot Placeholder
          </text>
        </svg>
      `;

      await sharp(Buffer.from(svgScreenshot))
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated ${screenshot.name} (${screenshot.width}x${screenshot.height})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${screenshot.name}:`, error.message);
    }
  }

  console.log('\n✨ Icon generation complete!');
  console.log('\nGenerated files:');
  console.log('  • pwa-192x192.png');
  console.log('  • pwa-512x512.png');
  console.log('  • apple-touch-icon.png');
  console.log('  • favicon-32x32.png');
  console.log('  • favicon-16x16.png');
  console.log('  • og-image.png');
  console.log('  • screenshot-wide.png');
  console.log('  • screenshot-narrow.png');
  console.log('\n📱 Your PWA is ready to install!');
}

// Run the generator
generateIcons().catch((error) => {
  console.error('❌ Icon generation failed:', error);
  process.exit(1);
});
