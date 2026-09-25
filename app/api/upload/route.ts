import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Only allow images
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only images are allowed" }, { status: 400 });
  }

  const pathname = `uploads/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const blob = await put(pathname, file, { access: "public" });

  return NextResponse.json({ url: blob.url, pathname: blob.pathname });
}