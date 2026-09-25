# Vercel Blob Image Gallery

Upload and display images using [Vercel Blob](https://vercel.com/docs/vercel-blob).

## Features

- Upload images (JPEG, PNG, GIF, WebP, SVG, BMP) via a form
- Dynamic gallery with grid/list toggle view
- Upload progress bar with estimated time remaining and speed
- Delete individual images
- Image details: filename, size, upload date

## Tech stack

- Next.js 15 (App Router)
- `@vercel/blob@2.8.0`
- Vercel Blob (public store)

## Local development

```bash
pnpm install
pnpm dev
```

## Deploy

```bash
vercel --prod
```

The Blob store and `BLOB_READ_WRITE_TOKEN` are auto-configured by Vercel.