import { list } from "@vercel/blob";
import GalleryView from "./GalleryView";
import UploadClient from "./UploadClient";
import PasswordGate from "./PasswordGate";

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
  let files: { url: string; deleteUrl: string; pathname: string; size?: number; category: FileCategory }[] = [];
  let error: string | null = null;
  try {
    const { blobs } = await list({ prefix: "uploads/" });
    files = blobs.map((b) => ({
      url: `/api/file/${b.pathname.replace("uploads/", "")}`,
      deleteUrl: b.url,
      pathname: b.pathname,
      size: b.size,
      category: categorize(b.pathname),
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load files";
  }

  return (
    <main className="container">
      <h1>Media Gallery</h1>
      <PasswordGate>
        {error ? (
          <p className="empty">⚠ {error}</p>
        ) : (
          <>
            <p className="subtitle">
              {files.length} file{files.length === 1 ? "" : "s"} stored in Vercel Blob
            </p>
            <UploadClient />
            <GalleryView images={files} />
          </>
        )}
      </PasswordGate>
    </main>
  );
}