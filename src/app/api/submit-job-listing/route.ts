import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;

  const email       = body.email as string;
  const password    = body.password as string;
  const fullName    = body.full_name as string;
  const phone       = (body.phone as string) || null;
  const companyName = body.company_name as string;
  const website     = (body.website as string) || null;
  const sector      = (body.sector as string) || null;

  const title          = body.title as string;
  const panel          = (body.panel as string) || "skilled";
  const category       = body.category as string;
  const jobType        = (body.job_type as string) || "full_time";
  const location       = body.location as string;
  const salaryMin      = body.salary_min ? parseFloat(body.salary_min as string) : null;
  const salaryMax      = body.salary_max ? parseFloat(body.salary_max as string) : null;
  const experience     = parseInt((body.experience as string) ?? "0") || 0;
  const openings       = parseInt((body.openings as string) ?? "1") || 1;
  const description    = body.description as string;
  const requirements   = (body.requirements as string) || null;
  const benefits       = (body.benefits as string) || null;

  const supabase = adminClient();

  // 1. Create auth user — trigger auto-creates profiles row
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name: fullName, role: "employer", locale: "tr" },
    email_confirm: false,
  });

  if (userError) {
    const msg = userError.message.includes("already registered")
      ? "Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın."
      : userError.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const userId = userData.user.id;

  // 2. Set phone on profile (trigger doesn't include phone)
  if (phone) {
    await supabase.from("profiles").update({ phone }).eq("id", userId);
  }

  // 3. Create company
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({ profile_id: userId, name: companyName, website, sector })
    .select("id")
    .single();

  if (companyError || !company) {
    await supabase.auth.admin.deleteUser(userId);
    return NextResponse.json(
      { error: companyError?.message ?? "Şirket oluşturulamadı." },
      { status: 400 }
    );
  }

  // 4. Create job
  const { error: jobError } = await supabase.from("jobs").insert({
    company_id: (company as Record<string, unknown>).id as string,
    employer_id: userId,
    title,
    description,
    requirements,
    benefits,
    category,
    panel,
    job_type: jobType,
    location,
    country: "TR",
    salary_min: salaryMin,
    salary_max: salaryMax,
    salary_currency: "TRY",
    experience_required: experience,
    languages_required: [],
    openings,
    status: "pending",
  });

  if (jobError) {
    await supabase.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: jobError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
