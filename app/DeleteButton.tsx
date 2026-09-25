"use client";

import { useState } from "react";

export default function DeleteButton({
  url,
  pathname,
}: {
  url: string;
  pathname: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: [url] }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Delete failed");
      }
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      style={{
        position: "absolute",
        top: 6,
        right: 6,
        background: "rgba(0,0,0,0.6)",
        color: "#fff",
        border: "none",
        borderRadius: "50%",
        width: 26,
        height: 26,
        cursor: "pointer",
        fontSize: 14,
        opacity: loading ? 0.5 : 1,
      }}
      aria-label={`Delete ${pathname}`}
      title="Delete"
    >
      {loading ? "…" : "×"}
    </button>
  );
}