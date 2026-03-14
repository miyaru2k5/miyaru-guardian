from pathlib import Path
path = Path('components/admin/posts/PostsList.tsx')
text = path.read_text()
start = text.index('const payload')
end = text.index('const handle ', start)
print(text[start:end])
