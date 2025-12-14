export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      patients: {
        Row: {
          accept_email: boolean
          accept_sms: boolean
          birth_place: string | null
          block_marketing: boolean
          civil_status: string | null
          cns: string | null
          communication_preferences: Json
          contact_notes: string | null
          contact_time_preference: string | null
          cpf: string | null
          cpf_status: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          deleted_at: string | null
          doc_validated_at: string | null
          doc_validated_by: string | null
          doc_validation_method: string | null
          doc_validation_source: string | null
          doc_validation_status: string | null
          education_level: string | null
          email: string | null
          email_verified: boolean
          external_ids: Json | null
          father_name: string | null
          full_name: string
          gender: string | null
          gender_identity: string | null
          id: string
          is_active: boolean
          is_pcd: boolean
          marketing_consent_history: string | null
          marketing_consent_ip: unknown
          marketing_consent_source: string | null
          marketing_consent_status: string | null
          marketing_consented_at: string | null
          mobile_phone: string
          mobile_phone_verified: boolean
          mother_name: string | null
          national_id: string | null
          nationality: string | null
          naturalness_city: string | null
          naturalness_country: string | null
          naturalness_state: string | null
          nickname: string | null
          onboarding_step: number
          photo_consent: boolean
          photo_consent_date: string | null
          photo_path: string | null
          pref_contact_method: string | null
          preferred_language: string | null
          primary_contractor_id: string | null
          profession: string | null
          pronouns: string | null
          race_color: string | null
          record_status: string
          rg: string | null
          rg_issued_at: string | null
          rg_issuer: string | null
          rg_issuer_state: string | null
          salutation: string | null
          secondary_phone: string | null
          secondary_phone_type: string | null
          social_name: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          accept_email?: boolean
          accept_sms?: boolean
          birth_place?: string | null
          block_marketing?: boolean
          civil_status?: string | null
          cns?: string | null
          communication_preferences?: Json
          contact_notes?: string | null
          contact_time_preference?: string | null
          cpf?: string | null
          cpf_status?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          doc_validated_at?: string | null
          doc_validated_by?: string | null
          doc_validation_method?: string | null
          doc_validation_source?: string | null
          doc_validation_status?: string | null
          education_level?: string | null
          email?: string | null
          email_verified?: boolean
          external_ids?: Json | null
          father_name?: string | null
          full_name: string
          gender?: string | null
          gender_identity?: string | null
          id?: string
          is_active?: boolean
          is_pcd?: boolean
          marketing_consent_history?: string | null
          marketing_consent_ip?: unknown
          marketing_consent_source?: string | null
          marketing_consent_status?: string | null
          marketing_consented_at?: string | null
          mobile_phone: string
          mobile_phone_verified?: boolean
          mother_name?: string | null
          national_id?: string | null
          nationality?: string | null
          naturalness_city?: string | null
          naturalness_country?: string | null
          naturalness_state?: string | null
          nickname?: string | null
          onboarding_step?: number
          photo_consent?: boolean
          photo_consent_date?: string | null
          photo_path?: string | null
          pref_contact_method?: string | null
          preferred_language?: string | null
          primary_contractor_id?: string | null
          profession?: string | null
          pronouns?: string | null
          race_color?: string | null
          record_status?: string
          rg?: string | null
          rg_issued_at?: string | null
          rg_issuer?: string | null
          rg_issuer_state?: string | null
          salutation?: string | null
          secondary_phone?: string | null
          secondary_phone_type?: string | null
          social_name?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          accept_email?: boolean
          accept_sms?: boolean
          birth_place?: string | null
          block_marketing?: boolean
          civil_status?: string | null
          cns?: string | null
          communication_preferences?: Json
          contact_notes?: string | null
          contact_time_preference?: string | null
          cpf?: string | null
          cpf_status?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          doc_validated_at?: string | null
          doc_validated_by?: string | null
          doc_validation_method?: string | null
          doc_validation_source?: string | null
          doc_validation_status?: string | null
          education_level?: string | null
          email?: string | null
          email_verified?: boolean
          external_ids?: Json | null
          father_name?: string | null
          full_name?: string
          gender?: string | null
          gender_identity?: string | null
          id?: string
          is_active?: boolean
          is_pcd?: boolean
          marketing_consent_history?: string | null
          marketing_consent_ip?: unknown
          marketing_consent_source?: string | null
          marketing_consent_status?: string | null
          marketing_consented_at?: string | null
          mobile_phone?: string
          mobile_phone_verified?: boolean
          mother_name?: string | null
          national_id?: string | null
          nationality?: string | null
          naturalness_city?: string | null
          naturalness_country?: string | null
          naturalness_state?: string | null
          nickname?: string | null
          onboarding_step?: number
          photo_consent?: boolean
          photo_consent_date?: string | null
          photo_path?: string | null
          pref_contact_method?: string | null
          preferred_language?: string | null
          primary_contractor_id?: string | null
          profession?: string | null
          pronouns?: string | null
          race_color?: string | null
          record_status?: string
          rg?: string | null
          rg_issued_at?: string | null
          rg_issuer?: string | null
          rg_issuer_state?: string | null
          salutation?: string | null
          secondary_phone?: string | null
          secondary_phone_type?: string | null
          social_name?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

