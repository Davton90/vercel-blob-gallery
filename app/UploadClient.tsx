"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

// Size limits per category (bytes)
const SIZE_LIMITS = {
  image: 10 * 1024 * 1024,      // 10 MB
  audio: 50 * 1024 * 1024,     // 50 MB
  video: 100 * 1024 * 1024,    // 100 MB
  document: 25 * 1024 * 1024,  // 25 MB
};

function categorize(file: File): "image" | "audio" | "video" | "document" | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("video/")) return "video";
  if (
    file.type === "application/pdf" ||
    file.type === "text/plain" ||
    file.type === "text/csv" ||
    file.type === "application/json"
  )
    return "document";
  return null;
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function UploadClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    // Validate size before upload
    const category = categorize(file);
    if (!category) {
      setMsg("Unsupported file type. Use image, audio, video, or document.");
      return;
    }
    const limit = SIZE_LIMITS[category];
    if (file.size > limit) {
      setMsg(`File too large. ${category} limit is ${fmtSize(limit)}.`);
      return;
    }

    setLoading(true);
    setProgress(0);
    setEta(null);
    setMsg(null);

    const started = Date.now();

    try {
      const result = await upload(`uploads/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        onUploadProgress: (ev) => {
          if (ev.total) {
            const pct = Math.round((ev.loaded / ev.total) * 100);
            setProgress(pct);
            const elapsed = (Date.now() - started) / 1000;
            const speed = ev.loaded / elapsed;
            const remaining = (ev.total - ev.loaded) / speed;
            const mins = Math.floor(remaining / 60);
            const secs = Math.floor(remaining % 60);
            setEta(
              pct < 100
                ? `${mins}m ${secs}s left · ${(speed / 1024 / 1024).toFixed(1)} MB/s`
                : "Done"
            );
          }
        },
      });

      setMsg("Uploaded. Refreshing...");
      setFile(null);
      window.location.reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
      setProgress(0);
      setEta(null);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ marginBottom: "1.5rem" }}>
      <input
        type="file"
        accept="image/*,audio/*,video/*,.pdf,.txt,.csv,.json"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          setFile(f);
          if (f) {
            const cat = categorize(f);
            if (!cat) {
              setMsg("Unsupported file type.");
            } else if (f.size > SIZE_LIMITS[cat]) {
              setMsg(`Too large. ${cat} limit is ${fmtSize(SIZE_LIMITS[cat])}.`);
            } else {
              setMsg(null);
            }
          } else {
            setMsg(null);
          }
        }}
        disabled={loading}
      />
      <button type="submit" disabled={loading || !file}>
        {loading ? "Uploading..." : "Upload"}
      </button>
      {msg && <span style={{ marginLeft: "0.5rem" }}>{msg}</span>}
      {loading && (
        <div style={{ marginTop: "0.75rem", maxWidth: 400 }}>
          <div className="progress-bar">
            <div
              className={`progress-fill${progress === 100 ? " done" : ""}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-meta">
            <span>{progress}%</span>
            {eta && <span>{eta}</span>}
          </div>
        </div>
      )}
    </form>
  );
}