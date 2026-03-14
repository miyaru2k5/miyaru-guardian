const fs = require('fs');
const text = fs.readFileSync('components/admin/posts/PostsList.tsx', 'utf8');
const start = text.indexOf('.split(');
const snippet = text.slice(start, start + 30);
console.log(JSON.stringify(snippet));
