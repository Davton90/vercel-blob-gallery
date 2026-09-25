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

interface QueueItem {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

export default function UploadClient() {
  const [queue, setQueue] = useState<QueueItem[]>([]);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    const valid: QueueItem[] = [];
    for (const file of selected) {
      const cat = categorize(file);
      if (!cat) {
        setQueue((prev) => [
          ...prev,
          { file, status: "error", progress: 0, error: "Unsupported type" },
        ]);
        continue;
      }
      const limit = SIZE_LIMITS[cat];
      if (file.size > limit) {
        setQueue((prev) => [
          ...prev,
          { file, status: "error", progress: 0, error: `Too large (limit ${fmtSize(limit)})` },
        ]);
        continue;
      }
      valid.push({ file, status: "pending", progress: 0 });
    }
    if (valid.length) setQueue((prev) => [...prev, ...valid]);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  async function uploadOne(item: QueueItem) {
    setQueue((prev) =>
      prev.map((q) =>
        q.file === item.file ? { ...q, status: "uploading", progress: 0 } : q
      )
    );
    const started = Date.now();
    try {
      await upload(`uploads/${item.file.name}`, item.file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        onUploadProgress: (ev) => {
          if (ev.total) {
            const pct = Math.round((ev.loaded / ev.total) * 100);
            setQueue((prev) =>
              prev.map((q) =>
                q.file === item.file ? { ...q, progress: pct } : q
              )
            );
          }
        },
      });
      setQueue((prev) =>
        prev.map((q) =>
          q.file === item.file ? { ...q, status: "done", progress: 100 } : q
        )
      );
    } catch (err) {
      setQueue((prev) =>
        prev.map((q) =>
          q.file === item.file
            ? { ...q, status: "error", progress: 0, error: err instanceof Error ? err.message : "Upload failed" }
            : q
        )
      );
    }
  }

  async function handleUploadAll() {
    const pending = queue.filter((q) => q.status === "pending");
    for (const item of pending) {
      await uploadOne(item);
    }
    // Refresh the page so newly uploaded files appear in the gallery
    setTimeout(() => window.location.reload(), 1500);
  }

  function handleClear() {
    setQueue((prev) => prev.filter((q) => q.status === "uploading"));
  }

  const pending = queue.filter((q) => q.status === "pending").length;
  const uploading = queue.filter((q) => q.status === "uploading").length;
  const done = queue.filter((q) => q.status === "done").length;
  const errors = queue.filter((q) => q.status === "error").length;
  const active = uploading > 0;

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pending > 0) handleUploadAll();
        }}
        style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}
      >
        <input
          type="file"
          accept="image/*,audio/*,video/*,.pdf,.txt,.csv,.json"
          multiple
          onChange={handleSelect}
          disabled={active}
        />
        <button type="submit" disabled={active || pending === 0}>
          {active ? "Uploading..." : `Upload ${pending > 0 ? `${pending} file${pending === 1 ? "" : "s"}` : ""}`}
        </button>
        {queue.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            disabled={active}
            style={{ background: "#fff", color: "#000", border: "1px solid #ddd" }}
          >
            Clear
          </button>
        )}
      </form>

      {queue.length > 0 && (
        <div className="upload-queue" style={{ marginTop: "1rem" }}>
          {queue.map((item, i) => (
            <div key={i} className="queue-item">
              <div className="queue-info">
                <span className="queue-name" title={item.file.name}>
                  {item.file.name.length > 40
                    ? item.file.name.slice(0, 38) + "…"
                    : item.file.name}
                </span>
                <span className="queue-meta">
                  {fmtSize(item.file.size)}
                  {item.error && <span className="queue-error"> · {item.error}</span>}
                </span>
              </div>
              {item.status === "uploading" && (
                <div className="progress-bar" style={{ flex: 1, margin: "0 0.5rem" }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
              {item.status === "done" && <span className="queue-status done">✓</span>}
              {item.status === "error" && <span className="queue-status err">✕</span>}
              {item.status === "pending" && <span className="queue-status">○</span>}
            </div>
          ))}
          {done > 0 && (
            <p className="queue-summary">
              {done} upload{done === 1 ? "" : "s"} complete · Refreshing page...
            </p>
          )}
        </div>
      )}
    </div>
  );
}