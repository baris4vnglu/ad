import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="tr">
      <body style={{ fontFamily: "Inter, sans-serif", background: "#f9fafb", margin: 0 }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "6rem", lineHeight: 1, marginBottom: "1.5rem" }}>🔍</div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#111827", margin: "0 0 0.5rem" }}>
            Sayfa Bulunamadı
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1rem", maxWidth: "28rem", margin: "0 0 2rem" }}>
            Aradığınız sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
          </p>
          <Link
            href="/tr"
            style={{
              background: "#2563eb",
              color: "white",
              fontWeight: 600,
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </body>
    </html>
  );
}
