import { list } from "@vercel/blob";
import GalleryView from "./GalleryView";
import UploadClient from "./UploadClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type FileCategory = "image" | "audio" | "video" | "document";

function categorize(pathname: string): FileCategory {
  if (/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(pathname)) return "image";
  if (/\.(mp3|wav|ogg|aac|flac|m4a)$/i.test(pathname)) return "audio";
  if (/\.(mp4|webm|mov|avi|mkv)$/i.test(pathname)) return "video";
  if (/\.(pdf|txt|csv|json|doc|docx)$/i.test(pathname)) return "document";
  return "image";
}

export default async function Page() {
  let images: { url: string; pathname: string; size?: number; category: FileCategory }[] = [];
  let error: string | null = null;
  try {
    const { blobs } = await list({ prefix: "uploads/" });
    images = blobs.map((b) => ({
      url: b.url,
      pathname: b.pathname,
      size: b.size,
      category: categorize(b.pathname),
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load files";
  }

  const counts = {
    image: images.filter((i) => i.category === "image").length,
    audio: images.filter((i) => i.category === "audio").length,
    video: images.filter((i) => i.category === "video").length,
    document: images.filter((i) => i.category === "document").length,
  };

  return (
    <main className="container">
      <h1>Media Gallery</h1>
      <p className="subtitle">
        {images.length} file{images.length === 1 ? "" : "s"} ·{" "}
        {counts.image} image{counts.image === 1 ? "" : "s"} ·{" "}
        {counts.video} video{counts.video === 1 ? "" : "s"} ·{" "}
        {counts.audio} audio{counts.audio === 1 ? "" : "s"} ·{" "}
        {counts.document} doc{counts.document === 1 ? "" : "s"}
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