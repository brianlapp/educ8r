export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      everflow_config: {
        Row: {
          api_key: string
          created_at: string
          id: number
          network_id: number
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: number
          network_id: number
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: number
          network_id?: number
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          beehiiv_id: string | null
          created_at: string | null
          id: string
          pap_referrer_id: string | null
          processed: boolean | null
          referral_code: string | null
          referral_url: string | null
          submission_data: Json
          updated_at: string | null
        }
        Insert: {
          beehiiv_id?: string | null
          created_at?: string | null
          id?: string
          pap_referrer_id?: string | null
          processed?: boolean | null
          referral_code?: string | null
          referral_url?: string | null
          submission_data: Json
          updated_at?: string | null
        }
        Update: {
          beehiiv_id?: string | null
          created_at?: string | null
          id?: string
          pap_referrer_id?: string | null
          processed?: boolean | null
          referral_code?: string | null
          referral_url?: string | null
          submission_data?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          content: string
          created_at: string | null
          id: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_submissions: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          converted: boolean | null
          created_at: string
          id: string
          referred_email: string
          referrer_id: string | null
          tracking_id: string | null
          updated_at: string
        }
        Insert: {
          converted?: boolean | null
          created_at?: string
          id?: string
          referred_email: string
          referrer_id?: string | null
          tracking_id?: string | null
          updated_at?: string
        }
        Update: {
          converted?: boolean | null
          created_at?: string
          id?: string
          referred_email?: string
          referrer_id?: string | null
          tracking_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "sweepstakes_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      sweepstakes: {
        Row: {
          beehiiv_tag: string | null
          button_color: string | null
          created_at: string | null
          current_entries: number | null
          description: string | null
          draw_type: string
          end_date: string
          entries_to_draw: number
          entry_value: number | null
          id: string
          image_url: string | null
          impression_pixel: string | null
          is_active: boolean | null
          prize_info: string | null
          prize_value: number | null
          progress_theme: string | null
          start_date: string
          thank_you_headline: string | null
          thank_you_image_url: string | null
          title: string
          tracking_url: string | null
          updated_at: string | null
        }
        Insert: {
          beehiiv_tag?: string | null
          button_color?: string | null
          created_at?: string | null
          current_entries?: number | null
          description?: string | null
          draw_type?: string
          end_date: string
          entries_to_draw?: number
          entry_value?: number | null
          id?: string
          image_url?: string | null
          impression_pixel?: string | null
          is_active?: boolean | null
          prize_info?: string | null
          prize_value?: number | null
          progress_theme?: string | null
          start_date?: string
          thank_you_headline?: string | null
          thank_you_image_url?: string | null
          title: string
          tracking_url?: string | null
          updated_at?: string | null
        }
        Update: {
          beehiiv_tag?: string | null
          button_color?: string | null
          created_at?: string | null
          current_entries?: number | null
          description?: string | null
          draw_type?: string
          end_date?: string
          entries_to_draw?: number
          entry_value?: number | null
          id?: string
          image_url?: string | null
          impression_pixel?: string | null
          is_active?: boolean | null
          prize_info?: string | null
          prize_value?: number | null
          progress_theme?: string | null
          start_date?: string
          thank_you_headline?: string | null
          thank_you_image_url?: string | null
          title?: string
          tracking_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sweepstakes_entries: {
        Row: {
          affiliate_id: string | null
          age: number | null
          beehiiv_entry_synced: boolean | null
          beehiiv_entry_synced_at: string | null
          beehiiv_subscriber_id: string | null
          country: string | null
          created_at: string | null
          email: string
          entry_count: number | null
          first_name: string
          gender: string | null
          id: string
          is_winner: boolean | null
          last_name: string
          network_affiliate_id: string | null
          pap_referral_id: string | null
          postal_code: string | null
          referral_count: number | null
          referral_url: string | null
          sponsor_signup: boolean | null
          sweepstakes_id: string | null
          terms_accepted: boolean
        }
        Insert: {
          affiliate_id?: string | null
          age?: number | null
          beehiiv_entry_synced?: boolean | null
          beehiiv_entry_synced_at?: string | null
          beehiiv_subscriber_id?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          entry_count?: number | null
          first_name: string
          gender?: string | null
          id?: string
          is_winner?: boolean | null
          last_name: string
          network_affiliate_id?: string | null
          pap_referral_id?: string | null
          postal_code?: string | null
          referral_count?: number | null
          referral_url?: string | null
          sponsor_signup?: boolean | null
          sweepstakes_id?: string | null
          terms_accepted?: boolean
        }
        Update: {
          affiliate_id?: string | null
          age?: number | null
          beehiiv_entry_synced?: boolean | null
          beehiiv_entry_synced_at?: string | null
          beehiiv_subscriber_id?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          entry_count?: number | null
          first_name?: string
          gender?: string | null
          id?: string
          is_winner?: boolean | null
          last_name?: string
          network_affiliate_id?: string | null
          pap_referral_id?: string | null
          postal_code?: string | null
          referral_count?: number | null
          referral_url?: string | null
          sponsor_signup?: boolean | null
          sweepstakes_id?: string | null
          terms_accepted?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "sweepstakes_entries_sweepstakes_id_fkey"
            columns: ["sweepstakes_id"]
            isOneToOne: false
            referencedRelation: "sweepstakes"
            referencedColumns: ["id"]
          },
        ]
      }
      sweepstakes_settings: {
        Row: {
          created_at: string | null
          id: string
          show_age_verification: boolean | null
          show_country_selection: boolean | null
          show_gender_selection: boolean | null
          sweepstakes_id: string | null
          updated_at: string | null
          use_beehiiv: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          show_age_verification?: boolean | null
          show_country_selection?: boolean | null
          show_gender_selection?: boolean | null
          sweepstakes_id?: string | null
          updated_at?: string | null
          use_beehiiv?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          show_age_verification?: boolean | null
          show_country_selection?: boolean | null
          show_gender_selection?: boolean | null
          sweepstakes_id?: string | null
          updated_at?: string | null
          use_beehiiv?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "sweepstakes_settings_sweepstakes_id_fkey"
            columns: ["sweepstakes_id"]
            isOneToOne: false
            referencedRelation: "sweepstakes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_configs: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          zapier_webhook_url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          zapier_webhook_url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          zapier_webhook_url?: string
        }
        Relationships: []
      }
      widget_versions: {
        Row: {
          bundle_hash: string
          changelog: string | null
          created_at: string | null
          deployed_at: string | null
          deployed_by: string | null
          id: string
          is_active: boolean | null
          version: string
        }
        Insert: {
          bundle_hash: string
          changelog?: string | null
          created_at?: string | null
          deployed_at?: string | null
          deployed_by?: string | null
          id?: string
          is_active?: boolean | null
          version: string
        }
        Update: {
          bundle_hash?: string
          changelog?: string | null
          created_at?: string | null
          deployed_at?: string | null
          deployed_by?: string | null
          id?: string
          is_active?: boolean | null
          version?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_role: {
        Args: {
          user_id: string
          role_name: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      deploy_widget_version: {
        Args: {
          p_version_id: string
          p_bundle_hash: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_referral_count: {
        Args: {
          p_referral_id: string
        }
        Returns: undefined
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_authenticated: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
