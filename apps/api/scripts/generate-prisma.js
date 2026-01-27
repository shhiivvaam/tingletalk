require('dotenv').config();
const { execSync } = require('child_process');

console.log('Loading environment variables...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set ✓' : 'Not set ✗');

try {
    console.log('\nGenerating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
    console.log('\n✓ Prisma Client generated successfully!');
} catch (error) {
    console.error('\n✗ Failed to generate Prisma Client');
    process.exit(1);
}
