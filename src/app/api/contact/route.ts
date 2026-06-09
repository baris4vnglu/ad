import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(50).optional().default(""),
  subject: z.string().max(200).optional().default(""),
  message: z.string().min(5).max(5000),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz veri." }, { status: 422 });
  }

  const supabase = await createClient();
  const { error } = await (supabase as any)
    .from("contact_messages")
    .insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });

  if (error) {
    console.error("contact insert error:", error);
    return NextResponse.json({ error: "Mesaj gönderilemedi, lütfen tekrar deneyin." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
