import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const ext = file.name.split(".").pop() || "png";

  const blob = await put(`screenshots/${id}.${ext}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return NextResponse.json({
    id,
    url: blob.url,
    filename: file.name,
    size: file.size,
    contentType: file.type,
    createdAt: new Date().toISOString(),
  });
}
