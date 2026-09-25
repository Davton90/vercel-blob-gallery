import { list } from "@vercel/blob";
import GalleryView from "./GalleryView";
import UploadClient from "./UploadClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  let images: { url: string; pathname: string; size?: number }[] = [];
  let error: string | null = null;
  try {
    const { blobs } = await list({ prefix: "uploads/" });
    images = blobs
      .filter((b) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(b.pathname))
      .map((b) => ({ url: b.url, pathname: b.pathname, size: b.size }));
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load images";
  }

  return (
    <main className="container">
      <h1>Image Gallery</h1>
      <p className="subtitle">
        {images.length} image{images.length === 1 ? "" : "s"} stored in Vercel Blob
      </p>
      <UploadClient />
      {error ? (
        <p className="empty">⚠ {error}</p>
      ) : (
        <GalleryView images={images} />
      )}
    </main>
  );
}