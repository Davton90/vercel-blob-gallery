"use client";

import { useState } from "react";

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

    const fd = new FormData();
    fd.append("file", file);

    // Use XHR for upload progress events
    const xhr = new XMLHttpRequest();
    const started = Date.now();

    await new Promise<void>((resolve, reject) => {
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          const pct = Math.round((ev.loaded / ev.total) * 100);
          setProgress(pct);
          const elapsed = (Date.now() - started) / 1000;
          const speed = ev.loaded / elapsed; // bytes/sec
          const remaining = (ev.total - ev.loaded) / speed;
          const mins = Math.floor(remaining / 60);
          const secs = Math.floor(remaining % 60);
          setEta(
            pct < 100
              ? `${mins}m ${secs}s left · ${(speed / 1024 / 1024).toFixed(1)} MB/s`
              : "Done"
          );
        }
      };
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(xhr.responseText || "Upload failed")));
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.open("POST", "/api/upload");
      xhr.send(fd);
    });

    try {
      const res = JSON.parse(xhr.responseText);
      if (res.error) throw new Error(res.error);
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
          <div
            style={{
              height: 8,
              background: "#e5e5e5",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: progress < 100 ? "#0070f3" : "#16a34a",
                transition: "width 0.2s ease",
              }}
            />
          </div>
          <div
            style={{
              marginTop: "0.35rem",
              fontSize: "0.8rem",
              color: "#666",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{progress}%</span>
            {eta && <span>{eta}</span>}
          </div>
        </div>
      )}
    </form>
  );
}