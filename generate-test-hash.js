const { generateTestHash } = require('./src/utils/auth');

async function main() {
  const hash = await generateTestHash('testpass123');
  console.log('Test password hash:', hash);
}

main();