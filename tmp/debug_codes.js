const fs = require('fs');
const text = fs.readFileSync('components/admin/posts/PostsList.tsx', 'utf8');
const start = text.indexOf('.split');
for (let i = 0; i < 10; i++) {
  console.log(text.charCodeAt(start + i));
}
