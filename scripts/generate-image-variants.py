import json
from pathlib import Path
from PIL import Image

site = Path(__file__).resolve().parents[1]
manifest = {}
generated = []
groups = [
    (list((site / 'assets/images').glob('home-background-*.webp')), [480, 960], 56),
    (list((site / 'assets/images').glob('gallery-*.webp')), [480], 76),
    (list((site / 'projects/electronic-design-2026-h/images').glob('*.webp')) +
     list((site / 'projects/smart-car-21-flying-wall/images').glob('*.webp')), [640], 76),
]
for files, widths, quality in groups:
    for source in files:
        if '-w' in source.stem:
            continue
        image = Image.open(source).convert('RGB')
        variants = []
        for width in widths:
            resized = image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS) if width < image.width else image
            target = source.with_name(source.stem + f'-w{resized.width}.webp')
            resized.save(target, 'WEBP', quality=quality, method=6)
            variants.append({'src': target.relative_to(site).as_posix(), 'width': resized.width})
            generated.append(target.relative_to(site).as_posix())
        manifest[source.relative_to(site).as_posix()] = {'width': image.width, 'height': image.height, 'variants': variants}
script = """'use strict';
(() => {
  const variants = __MANIFEST__;
  const site = new URL('.', document.currentScript.src);
  window.LAB_IMAGES = (image, value, sizes) => {
    const url = new URL(value, site);
    const key = url.origin === site.origin && url.pathname.startsWith(site.pathname) ? decodeURIComponent(url.pathname.slice(site.pathname.length)) : '';
    const item = variants[key];
    if (item) {
      image.width = item.width; image.height = item.height;
      image.sizes = sizes || '(max-width: 600px) calc(100vw - 44px), (max-width: 800px) calc(100vw - 70px), (max-width: 1200px) calc(100vw - 335px), 1024px';
      const choices = item.variants.map(v => new URL(v.src, site).href + ' ' + v.width + 'w');
      if (!key.includes('/home-background-')) choices.push(url.href + ' ' + item.width + 'w');
      image.srcset = choices.join(', ');
    }
    image.src = url.href;
  };
})();
""".replace('__MANIFEST__', json.dumps(manifest, ensure_ascii=False, separators=(',', ':')))
(site / 'images.js').write_text(script, encoding='utf-8')
for group in ['home-background-', 'gallery-']:
    originals = [site / name for name in manifest if group in name]
    smaller = [site / name for name in generated if group in name and '-w480' in name]
    print(group, 'original bytes', sum(p.stat().st_size for p in originals), 'small bytes', sum(p.stat().st_size for p in smaller))
print('Generated', len(generated), 'variants; original files preserved.')
