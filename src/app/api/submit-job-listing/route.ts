import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email:        z.string().email().max(255),
  password:     z.string().min(8).max(128),
  full_name:    z.string().min(2).max(100),
  phone:        z.string().max(30).optional(),
  company_name: z.string().min(2).max(200),
  website:      z.string().url().max(500).optional().or(z.literal("")),
  sector:       z.string().max(100).optional(),
  title:        z.string().min(3).max(200),
  panel:        z.enum(["skilled", "regular"]).default("skilled"),
  category:     z.string().min(1).max(100),
  job_type:     z.enum(["full_time", "part_time", "seasonal", "contract", "remote"]).default("full_time"),
  location:     z.string().min(2).max(200),
  salary_min:   z.string().optional(),
  salary_max:   z.string().optional(),
  experience:   z.string().optional(),
  openings:     z.string().optional(),
  description:  z.string().min(20).max(10000),
  requirements: z.string().max(5000).optional(),
  benefits:     z.string().max(5000).optional(),
});

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Geçersiz form verisi.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const {
    email, password, full_name: fullName, phone, company_name: companyName,
    website, sector, title, panel, category, job_type: jobType, location,
    salary_min, salary_max, experience, openings, description, requirements, benefits,
  } = parsed.data;

  const salaryMin = salary_min ? parseFloat(salary_min) : null;
  const salaryMax = salary_max ? parseFloat(salary_max) : null;
  const experienceYears = parseInt(experience ?? "0") || 0;
  const openingsCount = parseInt(openings ?? "1") || 1;

  const supabase = adminClient();

  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name: fullName, role: "employer", locale: "tr" },
    email_confirm: false,
  });

  if (userError) {
    const msg = userError.message.includes("already registered")
      ? "Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın."
      : "Kullanıcı oluşturulamadı.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const userId = userData.user.id;

  if (phone) {
    await supabase.from("profiles").update({ phone }).eq("id", userId);
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({ profile_id: userId, name: companyName, website: website || null, sector: sector || null })
    .select("id")
    .single();

  if (companyError || !company) {
    await supabase.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: "Şirket oluşturulamadı." }, { status: 400 });
  }

  const { error: jobError } = await supabase.from("jobs").insert({
    company_id: (company as Record<string, unknown>).id as string,
    employer_id: userId,
    title,
    description,
    requirements: requirements || null,
    benefits: benefits || null,
    category,
    panel,
    job_type: jobType,
    location,
    country: "TR",
    salary_min: salaryMin,
    salary_max: salaryMax,
    salary_currency: "TRY",
    experience_required: experienceYears,
    languages_required: [],
    openings: openingsCount,
    status: "pending",
  });

  if (jobError) {
    await supabase.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: "İlan oluşturulamadı." }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
