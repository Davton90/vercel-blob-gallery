import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

// Password-protected file access.
// Set FILE_PASSWORD in your Vercel project env vars.
// Append ?pw=secret to any file URL to access it.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("pw");

  const expected = process.env.FILE_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "FILE_PASSWORD not configured" },
      { status: 500 }
    );
  }
  if (password !== expected) {
    return NextResponse.json(
      { error: "Invalid or missing password" },
      { status: 401 }
    );
  }

  const { path } = await params;
  const pathname = `uploads/${path.join("/")}`;
  const blob = await get(pathname, { access: "public" });
  if (!blob) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contentType = blob.blob.contentType || blob.headers.get("content-type") || "application/octet-stream";
  return new Response(blob.stream, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    },
  });
}