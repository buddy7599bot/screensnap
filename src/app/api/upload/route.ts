import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const userId = formData.get("user_id") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const shortId = nanoid(10);
  const ext = file.name.split(".").pop() || "png";
  const storagePath = `${shortId}.${ext}`;

  // Get dimensions from client-sent headers or default to 0
  const width = parseInt(formData.get("width") as string) || 0;
  const height = parseInt(formData.get("height") as string) || 0;

  // Upload to Supabase Storage using service role (bypasses RLS)
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from("screenshots")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    return NextResponse.json({ error: "Upload failed: " + uploadError.message }, { status: 500 });
  }

  const { data: publicUrl } = supabase.storage.from("screenshots").getPublicUrl(storagePath);

  // Insert record (service role bypasses RLS)
  const { error: insertError } = await supabase.from("screenshots").insert({
    user_id: userId || null,
    short_id: shortId,
    original_name: file.name,
    file_url: publicUrl.publicUrl,
    thumbnail_url: publicUrl.publicUrl,
    file_size: file.size,
    width,
    height,
    mime_type: file.type,
    is_public: true,
    title: file.name,
    views: 0,
  });

  if (insertError) {
    console.error("DB insert error:", insertError);
    return NextResponse.json({ error: "Failed to save: " + insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    shortId,
    url: publicUrl.publicUrl,
    shareUrl: `/s/${shortId}`,
  });
}
