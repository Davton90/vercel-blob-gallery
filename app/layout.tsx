import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Image Gallery",
  description: "Upload and display images with Vercel Blob",
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}