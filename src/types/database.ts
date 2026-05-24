export type UserRole = "worker" | "employer" | "investor" | "admin";
export type JobType = "full_time" | "part_time" | "seasonal" | "contract" | "remote";
export type JobStatus = "draft" | "pending" | "active" | "rejected" | "expired" | "filled";
export type ApplicationStatus = "pending" | "reviewing" | "shortlisted" | "rejected" | "hired";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          locale: string;
          is_active: boolean;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      worker_profiles: {
        Row: {
          id: string;
          profile_id: string;
          title: string | null;
          bio: string | null;
          skills: string[];
          languages: string[];
          experience_years: number;
          desired_job_type: JobType | null;
          desired_location: string | null;
          desired_salary_min: number | null;
          desired_salary_max: number | null;
          cv_url: string | null;
          portfolio_url: string | null;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["worker_profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["worker_profiles"]["Insert"]>;
      };
      companies: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          description: string | null;
          website: string | null;
          logo_url: string | null;
          sector: string | null;
          size: string | null;
          country: string | null;
          city: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["companies"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
      };
      jobs: {
        Row: {
          id: string;
          company_id: string;
          employer_id: string;
          title: string;
          description: string;
          requirements: string | null;
          benefits: string | null;
          category: string;
          subcategory: string | null;
          panel: "skilled" | "regular";
          job_type: JobType;
          location: string;
          country: string;
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string;
          experience_required: number;
          languages_required: string[];
          openings: number;
          deadline: string | null;
          status: JobStatus;
          views: number;
          applications_count: number;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["jobs"]["Row"], "id" | "created_at" | "updated_at" | "views" | "applications_count">;
        Update: Partial<Database["public"]["Tables"]["jobs"]["Insert"]>;
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          worker_id: string;
          cover_letter: string | null;
          cv_url: string | null;
          status: ApplicationStatus;
          employer_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["applications"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["applications"]["Insert"]>;
      };
      conversations: {
        Row: {
          id: string;
          participant_one: string;
          participant_two: string;
          last_message_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["conversations"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["conversations"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          link: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      packages: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price_try: number;
          price_eur: number;
          job_limit: number;
          featured_limit: number;
          duration_days: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["packages"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["packages"]["Insert"]>;
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          package_id: string | null;
          amount: number;
          currency: string;
          provider: "stripe" | "iyzico";
          provider_payment_id: string | null;
          status: PaymentStatus;
          metadata: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payments"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      investor_inquiries: {
        Row: {
          id: string;
          profile_id: string | null;
          full_name: string;
          email: string;
          phone: string | null;
          budget_range: string | null;
          sector_interest: string | null;
          message: string | null;
          is_contacted: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["investor_inquiries"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["investor_inquiries"]["Insert"]>;
      };
      blog_posts: {
        Row: {
          id: string;
          author_id: string;
          slug: string;
          title_tr: string;
          title_en: string;
          content_tr: string;
          content_en: string;
          excerpt_tr: string | null;
          excerpt_en: string | null;
          cover_image: string | null;
          tags: string[];
          is_published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["blog_posts"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Insert"]>;
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      user_role: UserRole;
      job_type: JobType;
      job_status: JobStatus;
      application_status: ApplicationStatus;
      payment_status: PaymentStatus;
    };
  };
}
