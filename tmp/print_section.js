const fs = require('fs');
const text = fs.readFileSync('components/admin/posts/PostsList.tsx', 'utf8');
const start = text.indexOf('const tagsArray');
const end = text.indexOf('const payload', start);
console.log(text.slice(start, end));
