const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Source image path - using the logo.png as base
const sourceImage = path.join(__dirname, 'public', 'logo.png');
const outputDir = path.join(__dirname, 'public', 'icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
    console.log('🎨 Generating PWA icons...');

    for (const size of sizes) {
        try {
            await sharp(sourceImage)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 15, g: 23, b: 42, alpha: 1 } // slate-950
                })
                .png()
                .toFile(path.join(outputDir, `icon-${size}x${size}.png`));

            console.log(`✅ Generated icon-${size}x${size}.png`);
        } catch (error) {
            console.error(`❌ Error generating ${size}x${size} icon:`, error.message);
        }
    }

    console.log('🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);
