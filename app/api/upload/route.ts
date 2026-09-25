import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            // Images
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/bmp",
            "image/svg+xml",
            // Audio
            "audio/mpeg",
            "audio/wav",
            "audio/ogg",
            "audio/aac",
            "audio/flac",
            "audio/mp4",
            // Video
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "video/x-msvideo",
            // Documents
            "application/pdf",
            "text/plain",
            "text/csv",
            "application/json",
          ],
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("blob upload completed", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}