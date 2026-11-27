"""Refresh the inline Markdown fallback before publishing the site."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
project_root = root / 'projects'
files = json.loads((project_root / 'index.json').read_text(encoding='utf-8-sig'))
sources = {}
for name in files:
    file = (project_root / name).resolve()
    if not file.is_relative_to(project_root.resolve()) or file.suffix != '.md':
        raise ValueError('Invalid article path: ' + name)
    sources[name] = file.read_text(encoding='utf-8-sig')
data = json.dumps({'files': files, 'sources': sources}, ensure_ascii=False, separators=(',', ':'))
data = data.replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
block = '<script id="project-snapshot" type="application/json">' + data + '</script>'
file = root / 'index.html'
html = file.read_text(encoding='utf-8-sig')
pattern = r'<script id="project-snapshot" type="application/json">[\s\S]*?</script>'
if re.search(pattern, html):
    html = re.sub(pattern, lambda _: block, html, count=1)
else:
    html = html.replace('</head>', block + '\n</head>', 1)
file.write_text(html, encoding='utf-8')
print('Updated inline fallback for', len(files), 'Markdown articles')
