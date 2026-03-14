const fs = require('fs');
const lines = fs.readFileSync('app/bai-viet/[slug]/page.tsx', 'utf8').split(/\r?\n/);
const targetIndices = [19, 20, 21];
targetIndices.forEach((i) => {
  console.log(i + 1, lines[i]);
  console.log(lines[i].split('').map((ch) => ch.charCodeAt(0)).join(','));
});
