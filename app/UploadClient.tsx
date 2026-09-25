"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

export default function UploadClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setEta(null);
    setMsg(null);

    const started = Date.now();

    try {
      // Client-side upload: file goes directly from browser to Vercel Blob,
      // bypassing the function body size limit (4.5MB).
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
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
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