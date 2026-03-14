const fs = require('fs');
const path = 'components/admin/posts/PostsList.tsx';
const text = fs.readFileSync(path, 'utf8');
const start = text.indexOf('    const payload =');
const end = text.indexOf('    const handleCreateOrUpdate');
console.log(text.slice(start, end));
