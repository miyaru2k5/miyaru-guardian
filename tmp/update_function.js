const fs = require('fs');
const path = 'components/admin/posts/PostsList.tsx';
let text = fs.readFileSync(path, 'utf8');
const startMarker = '  const handleCreateOrUpdate = async (values: PostFormValues) =
const endMarker = '  /* TOGGLE PUBLISH */';
const start = text.indexOf(startMarker);
const end = text.indexOf(endMarker, start);
