import { del } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { urls } = await request.json();
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
  }

  try {
    await del(urls);
    return NextResponse.json({ ok: true, deleted: urls.length });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Delete failed" },
      { status: 500 }
    );
  }
}