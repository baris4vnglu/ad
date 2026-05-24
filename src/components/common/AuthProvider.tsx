"use client";

// Mounts the useUser hook once at the top of the tree so the auth store
// is populated before any child component reads from it.
import { useUser } from "@/hooks/useUser";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useUser(); // boots the Supabase listener and fills the Zustand store
  return <>{children}</>;
}
