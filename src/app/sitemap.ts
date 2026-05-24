import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://adglobalwork.com";
const LOCALES = ["tr", "en", "ar"];

const STATIC_PATHS = [
  "",
  "/nitelikli-isciler",
  "/normal-isciler",
  "/yatirimcilar",
  "/iletisim",
  "/ilan-ver",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  for (const locale of LOCALES) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1.0 : 0.8,
      });
    }
  }

  // Dynamic job pages
  try {
    const supabase = await createClient();
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, updated_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(500);

    for (const job of jobs ?? []) {
      const j = job as Record<string, unknown>;
      for (const locale of LOCALES) {
        entries.push({
          url: `${BASE_URL}/${locale}/jobs/${j.id as string}`,
          lastModified: new Date(j.updated_at as string),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  } catch {
    // Supabase not configured — skip dynamic entries
  }

  return entries;
}
