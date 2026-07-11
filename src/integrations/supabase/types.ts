export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agencies: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          hosts_count: number
          id: string
          livepulse_id: string | null
          logo_url: string | null
          managers_count: number
          mrr: number
          name: string
          owner_id: string | null
          plan: Database["public"]["Enums"]["agency_plan"]
          slug: string
          status: Database["public"]["Enums"]["agency_status"]
          updated_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          hosts_count?: number
          id?: string
          livepulse_id?: string | null
          logo_url?: string | null
          managers_count?: number
          mrr?: number
          name: string
          owner_id?: string | null
          plan?: Database["public"]["Enums"]["agency_plan"]
          slug: string
          status?: Database["public"]["Enums"]["agency_status"]
          updated_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          hosts_count?: number
          id?: string
          livepulse_id?: string | null
          logo_url?: string | null
          managers_count?: number
          mrr?: number
          name?: string
          owner_id?: string | null
          plan?: Database["public"]["Enums"]["agency_plan"]
          slug?: string
          status?: Database["public"]["Enums"]["agency_status"]
          updated_at?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          active: boolean
          agency_id: string
          base: string
          created_at: string
          host_id: string | null
          id: string
          manager_id: string | null
          percentage: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          agency_id: string
          base?: string
          created_at?: string
          host_id?: string | null
          id?: string
          manager_id?: string | null
          percentage: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          agency_id?: string
          base?: string
          created_at?: string
          host_id?: string | null
          id?: string
          manager_id?: string | null
          percentage?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          agency_id: string
          amount: number
          created_at: string
          currency: string
          description: string | null
          host_id: string | null
          id: string
          manager_id: string | null
          occurred_at: string
          reference: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          agency_id: string
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          host_id?: string | null
          id?: string
          manager_id?: string | null
          occurred_at?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          agency_id?: string
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          host_id?: string | null
          id?: string
          manager_id?: string | null
          occurred_at?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          agency_id: string
          created_at: string
          description: string | null
          ends_at: string | null
          host_id: string | null
          id: string
          period: Database["public"]["Enums"]["goal_period"]
          progress: number
          starts_at: string
          status: Database["public"]["Enums"]["goal_status"]
          target: number
          title: string
          updated_at: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          host_id?: string | null
          id?: string
          period?: Database["public"]["Enums"]["goal_period"]
          progress?: number
          starts_at?: string
          status?: Database["public"]["Enums"]["goal_status"]
          target: number
          title: string
          updated_at?: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          host_id?: string | null
          id?: string
          period?: Database["public"]["Enums"]["goal_period"]
          progress?: number
          starts_at?: string
          status?: Database["public"]["Enums"]["goal_status"]
          target?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
        ]
      }
      hosts: {
        Row: {
          agency_id: string
          avatar_url: string | null
          category: string | null
          city: string | null
          country: string | null
          created_at: string
          earnings_total: number
          email: string | null
          gifts_total: number
          id: string
          joined_at: string | null
          live_hours: number
          livepulse_id: string | null
          manager_id: string | null
          nickname: string
          platform: Database["public"]["Enums"]["host_platform"]
          score: number
          status: Database["public"]["Enums"]["host_status"]
          updated_at: string
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          agency_id: string
          avatar_url?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          earnings_total?: number
          email?: string | null
          gifts_total?: number
          id?: string
          joined_at?: string | null
          live_hours?: number
          livepulse_id?: string | null
          manager_id?: string | null
          nickname: string
          platform?: Database["public"]["Enums"]["host_platform"]
          score?: number
          status?: Database["public"]["Enums"]["host_status"]
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          agency_id?: string
          avatar_url?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          earnings_total?: number
          email?: string | null
          gifts_total?: number
          id?: string
          joined_at?: string | null
          live_hours?: number
          livepulse_id?: string | null
          manager_id?: string | null
          nickname?: string
          platform?: Database["public"]["Enums"]["host_platform"]
          score?: number
          status?: Database["public"]["Enums"]["host_status"]
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hosts_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hosts_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          agency_id: string
          created_at: string
          host_user_id: string
          id: string
          invited_by: string | null
          livepulse_id: string
          message: string | null
          responded_at: string | null
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          host_user_id: string
          id?: string
          invited_by?: string | null
          livepulse_id: string
          message?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          host_user_id?: string
          id?: string
          invited_by?: string | null
          livepulse_id?: string
          message?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      managers: {
        Row: {
          agency_id: string
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          livepulse_id: string | null
          name: string
          status: string
          team_size: number
          updated_at: string
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          agency_id: string
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          livepulse_id?: string | null
          name: string
          status?: string
          team_size?: number
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          agency_id?: string
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          livepulse_id?: string | null
          name?: string
          status?: string
          team_size?: number
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "managers_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          agency_id: string | null
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          agency_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          agency_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          description: string | null
          duration_days: number
          id: string
          max_hosts: number
          max_managers: number
          name: string
          price_monthly: number
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          duration_days?: number
          id?: string
          max_hosts?: number
          max_managers?: number
          name: string
          price_monthly?: number
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          description?: string | null
          duration_days?: number
          id?: string
          max_hosts?: number
          max_managers?: number
          name?: string
          price_monthly?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agency_id: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          livepulse_id: string | null
          locale: string
          name: string | null
          platform: string | null
          platform_user_id: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          agency_id?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id: string
          livepulse_id?: string | null
          locale?: string
          name?: string | null
          platform?: string | null
          platform_user_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          agency_id?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          livepulse_id?: string | null
          locale?: string
          name?: string | null
          platform?: string | null
          platform_user_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      rankings: {
        Row: {
          agency_id: string
          category: string | null
          created_at: string
          host_id: string
          id: string
          period: Database["public"]["Enums"]["goal_period"]
          period_start: string
          position: number
          score: number
        }
        Insert: {
          agency_id: string
          category?: string | null
          created_at?: string
          host_id: string
          id?: string
          period?: Database["public"]["Enums"]["goal_period"]
          period_start: string
          position: number
          score?: number
        }
        Update: {
          agency_id?: string
          category?: string | null
          created_at?: string
          host_id?: string
          id?: string
          period?: Database["public"]["Enums"]["goal_period"]
          period_start?: string
          position?: number
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "rankings_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rankings_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          agency_id: string
          created_at: string
          currency: string
          current_period_end: string | null
          id: string
          max_hosts: number | null
          max_managers: number | null
          payment_notes: string | null
          plan: Database["public"]["Enums"]["agency_plan"]
          price_monthly: number
          seats: number
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          agency_id: string
          created_at?: string
          currency?: string
          current_period_end?: string | null
          id?: string
          max_hosts?: number | null
          max_managers?: number | null
          payment_notes?: string | null
          plan?: Database["public"]["Enums"]["agency_plan"]
          price_monthly?: number
          seats?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          agency_id?: string
          created_at?: string
          currency?: string
          current_period_end?: string | null
          id?: string
          max_hosts?: number | null
          max_managers?: number | null
          payment_notes?: string | null
          plan?: Database["public"]["Enums"]["agency_plan"]
          price_monthly?: number
          seats?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: true
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          agency_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          agency_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          agency_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: { Args: { _invitation_id: string }; Returns: string }
      confirm_subscription_payment: {
        Args: { _notes?: string; _subscription_id: string }
        Returns: undefined
      }
      current_agency_id: { Args: never; Returns: string }
      decline_invitation: {
        Args: { _invitation_id: string }
        Returns: undefined
      }
      generate_livepulse_id: { Args: { _prefix: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_agency_owner_of: { Args: { _agency_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      agency_plan: "starter" | "growth" | "scale" | "enterprise"
      agency_status: "active" | "trial" | "suspended" | "cancelled"
      app_role: "super_admin" | "agency_owner" | "manager" | "host"
      goal_period: "weekly" | "monthly" | "quarterly"
      goal_status: "active" | "completed" | "failed" | "cancelled"
      host_platform: "tiktok" | "kwai" | "bigo" | "other"
      host_status: "active" | "inactive" | "pending"
      invitation_status: "pending" | "accepted" | "declined" | "cancelled"
      notification_type: "info" | "success" | "warning" | "danger"
      subscription_status:
        | "active"
        | "awaiting_payment"
        | "trial"
        | "suspended"
        | "cancelled"
        | "past_due"
      transaction_status: "pending" | "confirmed" | "paid" | "failed"
      transaction_type:
        | "revenue"
        | "payout"
        | "commission"
        | "refund"
        | "adjustment"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agency_plan: ["starter", "growth", "scale", "enterprise"],
      agency_status: ["active", "trial", "suspended", "cancelled"],
      app_role: ["super_admin", "agency_owner", "manager", "host"],
      goal_period: ["weekly", "monthly", "quarterly"],
      goal_status: ["active", "completed", "failed", "cancelled"],
      host_platform: ["tiktok", "kwai", "bigo", "other"],
      host_status: ["active", "inactive", "pending"],
      invitation_status: ["pending", "accepted", "declined", "cancelled"],
      notification_type: ["info", "success", "warning", "danger"],
      subscription_status: [
        "active",
        "awaiting_payment",
        "trial",
        "suspended",
        "cancelled",
        "past_due",
      ],
      transaction_status: ["pending", "confirmed", "paid", "failed"],
      transaction_type: [
        "revenue",
        "payout",
        "commission",
        "refund",
        "adjustment",
      ],
    },
  },
} as const
