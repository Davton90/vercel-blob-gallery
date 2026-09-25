"use client";

import DeleteButton from "./DeleteButton";
import { useState } from "react";

const STORAGE_KEY = "gallery_pw";

function withPassword(url: string): string {
  if (typeof window === "undefined") return url;
  const pw = sessionStorage.getItem(STORAGE_KEY);
  if (!pw) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}pw=${encodeURIComponent(pw)}`;
}

type FileCategory = "image" | "audio" | "video" | "document";

interface FileItem {
  url: string;
  deleteUrl: string;
  pathname: string;
  size?: number;
  category: FileCategory;
}

function fmtSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fmtDate(pathname: string) {
  const ts = pathname.match(/^uploads\/(\d+)/)?.[1];
  if (!ts) return "";
  return new Date(Number(ts)).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Preview({ item }: { item: FileItem }) {
  const src = withPassword(item.url);
  switch (item.category) {
    case "image":
      return (
        <img
          src={src}
          alt={item.pathname}
          loading="lazy"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      );
    case "video":
      return (
        <video
          src={src}
          controls
          preload="metadata"
          style={{ width: "100%", height: "auto", display: "block", borderRadius: 6 }}
        />
      );
    case "audio":
      return (
        <div className="media-placeholder audio">
          <span className="media-icon">🎵</span>
          <audio src={src} controls preload="none" style={{ width: "100%", marginTop: 8 }} />
        </div>
      );
    case "document":
      return (
        <div className="media-placeholder doc">
          <span className="media-icon">📄</span>
          <span className="media-name">{item.pathname.split("/").pop()}</span>
        </div>
      );
  }
}

export default function GalleryView({ images }: { images: FileItem[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");

  if (images.length === 0) {
    return <p className="empty">No files yet. Upload one above.</p>;
  }

  return (
    <div>
      <div className="view-toggle">
        <button
          type="button"
          className={view === "grid" ? "active" : ""}
          onClick={() => setView("grid")}
          aria-label="Grid view"
          title="Grid view"
        >
          ⊞ Grid
        </button>
        <button
          type="button"
          className={view === "list" ? "active" : ""}
          onClick={() => setView("list")}
          aria-label="List view"
          title="List view"
        >
          ≡ List
        </button>
      </div>

      <div className={view === "list" ? "list-view" : "grid-view grid"} style={{ marginTop: "1rem" }}>
        {images.map((item) => (
          <div
            key={item.url}
            className={view === "list" ? "list-item" : "card"}
            style={{ position: "relative" }}
          >
            <DeleteButton deleteUrl={item.deleteUrl} pathname={item.pathname} />

            {view === "grid" ? (
              <Preview item={item} />
            ) : (
              <div className="list-thumb">
                <Preview item={item} />
              </div>
            )}

            <div className={view === "list" ? "list-info" : "meta"} style={{ flex: 1 }}>
              <div className="list-title">{item.pathname.replace("uploads/", "")}</div>
              <div className="list-detail">
                <span>📅 {fmtDate(item.pathname)}</span>
                <span>💾 {fmtSize(item.size)}</span>
                <span>📁 {item.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}