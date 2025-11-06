// Temporary search to find tabs section in AdminDashboard
const fs = require('fs');
const content = fs.readFileSync('/components/AdminDashboard.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('TabsList') || lines[i].includes('TrendingUp')) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
    // Show context around found line
    for (let j = Math.max(0, i - 5); j <= Math.min(lines.length - 1, i + 20); j++) {
      console.log(`${j + 1}: ${lines[j]}`);
    }
    break;
  }
}