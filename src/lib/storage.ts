import { createClient } from "@/lib/supabase/client";

export type StorageBucket = "avatars" | "cvs" | "logos";

const MAX_SIZES: Record<StorageBucket, number> = {
  avatars: 2 * 1024 * 1024,   // 2 MB
  cvs: 10 * 1024 * 1024,      // 10 MB
  logos: 2 * 1024 * 1024,     // 2 MB
};

const ALLOWED_TYPES: Record<StorageBucket, string[]> = {
  avatars: ["image/jpeg", "image/png", "image/webp"],
  cvs: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  logos: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
};

export interface UploadResult {
  path: string | null;
  publicUrl: string | null;
  error: string | null;
}

export async function uploadFile(
  bucket: StorageBucket,
  userId: string,
  file: File,
  fileNamePrefix?: string
): Promise<UploadResult> {
  if (file.size > MAX_SIZES[bucket]) {
    return { path: null, publicUrl: null, error: `Dosya boyutu ${MAX_SIZES[bucket] / 1024 / 1024} MB'yi geçemez.` };
  }

  if (!ALLOWED_TYPES[bucket].includes(file.type)) {
    return { path: null, publicUrl: null, error: "Desteklenmeyen dosya türü." };
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const prefix = fileNamePrefix ?? Date.now().toString();
  const path = `${userId}/${prefix}.${ext}`;

  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) {
    return { path: null, publicUrl: null, error: error.message };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl, error: null };
}

export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
