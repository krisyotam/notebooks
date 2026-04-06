# Image Grid Templates

Images go at the bottom of every notebook, always in a grid. Max 9 images.
Paste the appropriate template and fill in src, alt, and figcaption.

---

## 1 Image (Centered)

```html
<div style="display: flex; justify-content: center; margin: 24px 0;">
  <figure style="margin: 0; text-align: center; max-width: 400px;">
    <img src="SRC" alt="ALT" style="width: 100%; height: 200px; object-fit: cover;">
    <figcaption style="font-size: 0.8em; color: #666; margin-top: 4px;">CAPTION</figcaption>
  </figure>
</div>
```

## 2 Images (Side by Side)

```html
<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 24px 0; max-width: 600px; margin-left: auto; margin-right: auto;">
  <figure style="margin: 0; text-align: center;">
    <img src="SRC" alt="ALT" style="width: 100%; height: 200px; object-fit: cover;">
    <figcaption style="font-size: 0.8em; color: #666; margin-top: 4px;">CAPTION</figcaption>
  </figure>
  <figure style="margin: 0; text-align: center;">
    <img src="SRC" alt="ALT" style="width: 100%; height: 200px; object-fit: cover;">
    <figcaption style="font-size: 0.8em; color: #666; margin-top: 4px;">CAPTION</figcaption>
  </figure>
</div>
```

## 3-9 Images (3-Column Grid)

```html
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 24px 0;">
  <figure style="margin: 0; text-align: center;">
    <img src="SRC" alt="ALT" style="width: 100%; height: 200px; object-fit: cover;">
    <figcaption style="font-size: 0.8em; color: #666; margin-top: 4px;">CAPTION</figcaption>
  </figure>
  <!-- repeat figure block for each image, 3-9 total -->
</div>
```

## Rules

- Images always at the bottom, after all text content
- Max 9 images per notebook
- All images served from CDN: `https://krisyotam.com/cdn/images/...`
- Convert to WebP, 400px wide, quality 80 for grid thumbnails
- Filenames: lowercase, hyphen-separated, descriptive
- Upload to stargate: `scp image.webp server:/mnt/storage/cdn/images/{category}/`
- Set permissions: `chmod 644` after upload
