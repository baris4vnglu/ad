import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? `/${locale}`;
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth/magic-link errors
  if (error) {
    const errorUrl = new URL(`/${locale}/auth/login`, request.url);
    errorUrl.searchParams.set("error", errorDescription ?? error);
    return NextResponse.redirect(errorUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      const errorUrl = new URL(`/${locale}/auth/login`, request.url);
      errorUrl.searchParams.set("error", sessionError.message);
      return NextResponse.redirect(errorUrl);
    }

    // Fetch profile to determine role-based redirect
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = (await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()) as { data: { role: string } | null; error: unknown };

      if (profile) {
        const roleRedirects: Record<string, string> = {
          worker: `/${locale}/worker`,
          employer: `/${locale}/employer`,
          investor: `/${locale}/investor`,
          admin: `/${locale}/admin`,
        };
        const destination = roleRedirects[profile.role] ?? `/${locale}`;
        return NextResponse.redirect(new URL(destination, request.url));
      }
    }

    // Fallback: go to the `next` param or home
    const forwardedUrl = next.startsWith("/") ? new URL(next, request.url) : new URL(`/${locale}`, request.url);
    return NextResponse.redirect(forwardedUrl);
  }

  // No code — redirect home
  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}
