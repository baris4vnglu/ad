import { create } from "zustand";
import type { User } from "@supabase/supabase-js";

export type UserRole = "worker" | "employer" | "investor" | "admin";

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  locale: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ user: null, profile: null, loading: false }),
}));
