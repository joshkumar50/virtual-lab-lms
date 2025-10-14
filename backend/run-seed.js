// Simple script to run seed after deployment
// Run this with: node run-seed.js

const { spawn } = require('child_process');

console.log('🌱 Running seed script...');

const seedProcess = spawn('node', ['seed.js'], {
  stdio: 'inherit',
  shell: true
});

seedProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Seed script completed successfully!');
    console.log('🎉 Your database now has demo courses and labs!');
  } else {
    console.log('❌ Seed script failed with code:', code);
  }
});

seedProcess.on('error', (err) => {
  console.error('❌ Error running seed script:', err);
});

