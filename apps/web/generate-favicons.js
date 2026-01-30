const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Source image - using the 192x192 icon as base
const sourceImage = path.join(__dirname, 'public', 'icons', 'icon-192x192.png');
const outputDir = path.join(__dirname, 'public');

async function generateFavicons() {
    console.log('🎨 Generating favicons...');

    try {
        // Generate favicon.ico (32x32)
        await sharp(sourceImage)
            .resize(32, 32, {
                fit: 'contain',
                background: { r: 15, g: 23, b: 42, alpha: 1 }
            })
            .png()
            .toFile(path.join(outputDir, 'favicon-32x32.png'));
        console.log('✅ Generated favicon-32x32.png');

        // Generate favicon-16x16.png
        await sharp(sourceImage)
            .resize(16, 16, {
                fit: 'contain',
                background: { r: 15, g: 23, b: 42, alpha: 1 }
            })
            .png()
            .toFile(path.join(outputDir, 'favicon-16x16.png'));
        console.log('✅ Generated favicon-16x16.png');

        // Replace the huge favicon.png with a reasonable 48x48 version
        await sharp(sourceImage)
            .resize(48, 48, {
                fit: 'contain',
                background: { r: 15, g: 23, b: 42, alpha: 1 }
            })
            .png()
            .toFile(path.join(outputDir, 'favicon.png'));
        console.log('✅ Generated favicon.png (48x48)');

        // Apple touch icon (180x180)
        await sharp(sourceImage)
            .resize(180, 180, {
                fit: 'contain',
                background: { r: 15, g: 23, b: 42, alpha: 1 }
            })
            .png()
            .toFile(path.join(outputDir, 'apple-touch-icon.png'));
        console.log('✅ Generated apple-touch-icon.png');

        console.log('🎉 All favicons generated successfully!');
    } catch (error) {
        console.error('❌ Error generating favicons:', error.message);
    }
}

generateFavicons();
