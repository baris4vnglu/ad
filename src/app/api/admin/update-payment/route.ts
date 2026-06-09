import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  paymentId: z.string().uuid(),
  status: z.enum(["pending", "completed", "failed", "refunded"]),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single() as { data: { role: string } | null; error: unknown };

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz parametreler." }, { status: 400 });
  }

  const { paymentId, status } = parsed.data;

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await admin
    .from("payments")
    .update({ status })
    .eq("id", paymentId);

  if (error) return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 400 });

  // Audit log
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("audit_logs").insert({
    admin_id: user.id,
    action: `payment_${status}`,
    target_type: "payment",
    target_id: paymentId,
    details: { new_status: status },
  });

  return NextResponse.json({ success: true });
}
