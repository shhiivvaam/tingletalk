const sharp = require('sharp');
const path = require('path');

// Use the actual logo
const sourceImage = path.join(__dirname, 'public', 'logo.png');
const outputIcon = path.join(__dirname, 'src', 'app', 'icon.png');
const outputAppleIcon = path.join(__dirname, 'src', 'app', 'apple-icon.png');

async function updateIconsFromLogo() {
    console.log('🎨 Updating icons from logo...');

    try {
        // Generate icon.png (32x32) from logo
        await sharp(sourceImage)
            .resize(32, 32, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
            })
            .png()
            .toFile(outputIcon);
        console.log('✅ Updated icon.png (32x32) from logo');

        // Generate apple-icon.png (180x180) from logo
        await sharp(sourceImage)
            .resize(180, 180, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
            })
            .png()
            .toFile(outputAppleIcon);
        console.log('✅ Updated apple-icon.png (180x180) from logo');

        console.log('🎉 Icons updated successfully from logo!');
    } catch (error) {
        console.error('❌ Error updating icons:', error.message);
    }
}

updateIconsFromLogo();
