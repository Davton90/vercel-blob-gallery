"use client";

import { useState, useEffect, ReactNode } from "react";

const STORAGE_KEY = "gallery_pw";

export default function PasswordGate({ children }: { children: ReactNode }) {
  const [pw, setPw] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore password from session storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPw(saved);
      setAuthenticated(true);
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pw.trim()) return;
    sessionStorage.setItem(STORAGE_KEY, pw.trim());
    setAuthenticated(true);
    setError(null);
  }

  function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthenticated(false);
    setPw("");
  }

  if (authenticated) {
    return (
      <div>
        <div className="pw-bar">
          <span>🔓 Access granted</span>
          <button type="button" onClick={handleLogout} className="pw-logout">
            Logout
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="pw-gate">
      <div className="pw-card">
        <h2>🔒 Content Locked</h2>
        <p>Enter the access password to view uploaded files.</p>
        <form onSubmit={handleSubmit} className="pw-form">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Access password"
            autoFocus
          />
          <button type="submit">Unlock</button>
        </form>
        {error && <p className="pw-error">{error}</p>}
      </div>
    </div>
  );
}