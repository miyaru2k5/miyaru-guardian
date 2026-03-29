const fs = require('fs');
const path = 'components/admin/posts/PostsList.tsx';
let text = fs.readFileSync(path, 'utf8');
const replacements = [
  ['.split(,)', '.split(,)'],
  ['.from( posts)', '.from( posts)'],
  ['.eq(id, editing.id)', '.eq(id, editing.id)'],
  ['.from(posts)', '.from(posts)'],
  ['.select(id)', '.select(id)'],
  ['.from(post_images)', '.from(post_images)'],
  ['.eq(post_id, postId)', '.eq(post_id, postId)'],
];
for (const [oldValue, newValue] of replacements) {
  text = text.split(oldValue).join(newValue);
}
fs.writeFileSync(path, text, 'utf8');
