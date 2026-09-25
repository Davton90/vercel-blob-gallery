"use client";

import DeleteButton from "./DeleteButton";
import { useState } from "react";

type ViewMode = "grid" | "list";

export default function GalleryView({
  images,
}: {
  images: { url: string; pathname: string; size?: number }[];
}) {
  const [view, setView] = useState<ViewMode>("grid");

  if (images.length === 0) {
    return <p className="empty">No images yet. Upload one above.</p>;
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

      <div
        className={view === "list" ? "list-view" : "grid-view grid"}
        style={{ marginTop: "1rem" }}
      >
        {images.map((blob) => (
          <div
            key={blob.url}
            className={view === "list" ? "list-item" : "card"}
            style={{ position: "relative" }}
          >
            <DeleteButton url={blob.url} pathname={blob.pathname} />

            {view === "grid" ? (
              <img
                src={blob.url}
                alt={blob.pathname}
                loading="lazy"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            ) : (
              <div className="list-thumb">
                <img
                  src={blob.url}
                  alt={blob.pathname}
                  loading="lazy"
                />
              </div>
            )}

            <div
              className={view === "list" ? "list-info" : "meta"}
              style={{ flex: 1 }}
            >
              <div className="list-title">
                {blob.pathname.replace("uploads/", "")}
              </div>
              <div className="list-detail">
                <span>📅 {fmtDate(blob.pathname)}</span>
                <span>💾 {fmtSize(blob.size)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}