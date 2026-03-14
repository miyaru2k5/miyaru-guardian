const fs = require('fs');
const text = fs.readFileSync('components/admin/posts/PostsList.tsx', 'utf8');
const start = text.indexOf('.split');
console.log(JSON.stringify(text.slice(start, start + 20)));
