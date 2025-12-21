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
      patient_addresses: {
        Row: {
          address_label: string
          address_purpose: string
          address_source: string
          cep_last_lookup_at: string | null
          cep_last_lookup_source: string | null
          cep_lookup_payload: Json | null
          city: string
          complement: string | null
          country: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          geocode_cache_until: string | null
          geocode_error_message: string | null
          geocode_payload: Json | null
          geocode_place_id: string | null
          geocode_precision: string | null
          geocode_provider: string | null
          geocode_refreshed_at: string | null
          geocode_status: string | null
          id: string
          is_primary: boolean
          latitude: number | null
          longitude: number | null
          neighborhood: string
          number: string
          patient_id: string
          postal_code: string
          reference_point: string | null
          risk_cache_until: string | null
          risk_error_message: string | null
          risk_level: string | null
          risk_payload: Json | null
          risk_provider: string | null
          risk_refreshed_at: string | null
          risk_score: number | null
          risk_status: string | null
          state: string
          street: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address_label?: string
          address_purpose?: string
          address_source?: string
          cep_last_lookup_at?: string | null
          cep_last_lookup_source?: string | null
          cep_lookup_payload?: Json | null
          city: string
          complement?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          geocode_cache_until?: string | null
          geocode_error_message?: string | null
          geocode_payload?: Json | null
          geocode_place_id?: string | null
          geocode_precision?: string | null
          geocode_provider?: string | null
          geocode_refreshed_at?: string | null
          geocode_status?: string | null
          id?: string
          is_primary?: boolean
          latitude?: number | null
          longitude?: number | null
          neighborhood: string
          number: string
          patient_id: string
          postal_code: string
          reference_point?: string | null
          risk_cache_until?: string | null
          risk_error_message?: string | null
          risk_level?: string | null
          risk_payload?: Json | null
          risk_provider?: string | null
          risk_refreshed_at?: string | null
          risk_score?: number | null
          risk_status?: string | null
          state: string
          street: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address_label?: string
          address_purpose?: string
          address_source?: string
          cep_last_lookup_at?: string | null
          cep_last_lookup_source?: string | null
          cep_lookup_payload?: Json | null
          city?: string
          complement?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          geocode_cache_until?: string | null
          geocode_error_message?: string | null
          geocode_payload?: Json | null
          geocode_place_id?: string | null
          geocode_precision?: string | null
          geocode_provider?: string | null
          geocode_refreshed_at?: string | null
          geocode_status?: string | null
          id?: string
          is_primary?: boolean
          latitude?: number | null
          longitude?: number | null
          neighborhood?: string
          number?: string
          patient_id?: string
          postal_code?: string
          reference_point?: string | null
          risk_cache_until?: string | null
          risk_error_message?: string | null
          risk_level?: string | null
          risk_payload?: Json | null
          risk_provider?: string | null
          risk_refreshed_at?: string | null
          risk_score?: number | null
          risk_status?: string | null
          state?: string
          street?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_addresses_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_address_logistics: {
        Row: {
          access_conditions: string | null
          adapted_bathroom: boolean
          address_id: string
          allowed_visit_hours: string | null
          ambulance_access: string | null
          animals_behavior: string | null
          area_risk_type: string | null
          backup_power_desc: string | null
          backup_power_source: string | null
          bed_type: string | null
          block_tower: string | null
          cell_signal_quality: string | null
          concierge_contact: string | null
          condo_name: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          distance_km: number | null
          electric_voltage: string | null
          elevator_status: string | null
          entry_procedure: string | null
          equipment_space: string | null
          external_stairs: string | null
          facade_image_url: string | null
          floor_number: number | null
          gate_identification: string | null
          general_observations: string | null
          has_24h_concierge: boolean
          has_smokers: boolean
          has_wifi: boolean
          hygiene_conditions: string | null
          lighting_quality: string | null
          mattress_type: string | null
          night_access_risk: string | null
          noise_level: string | null
          parking: string | null
          pets_description: string | null
          power_outlets_desc: string | null
          property_type: string | null
          street_access_type: string | null
          team_parking: string | null
          tenant_id: string
          travel_notes: string | null
          travel_time_min: number | null
          unit_number: string | null
          updated_at: string
          updated_by: string | null
          ventilation: string | null
          water_source: string | null
          wheelchair_access: string | null
          zone_type: string | null
        }
        Insert: {
          access_conditions?: string | null
          adapted_bathroom?: boolean
          address_id: string
          allowed_visit_hours?: string | null
          ambulance_access?: string | null
          animals_behavior?: string | null
          area_risk_type?: string | null
          backup_power_desc?: string | null
          backup_power_source?: string | null
          bed_type?: string | null
          block_tower?: string | null
          cell_signal_quality?: string | null
          concierge_contact?: string | null
          condo_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          distance_km?: number | null
          electric_voltage?: string | null
          elevator_status?: string | null
          entry_procedure?: string | null
          equipment_space?: string | null
          external_stairs?: string | null
          facade_image_url?: string | null
          floor_number?: number | null
          gate_identification?: string | null
          general_observations?: string | null
          has_24h_concierge?: boolean
          has_smokers?: boolean
          has_wifi?: boolean
          hygiene_conditions?: string | null
          lighting_quality?: string | null
          mattress_type?: string | null
          night_access_risk?: string | null
          noise_level?: string | null
          parking?: string | null
          pets_description?: string | null
          power_outlets_desc?: string | null
          property_type?: string | null
          street_access_type?: string | null
          team_parking?: string | null
          tenant_id?: string
          travel_notes?: string | null
          travel_time_min?: number | null
          unit_number?: string | null
          updated_at?: string
          updated_by?: string | null
          ventilation?: string | null
          water_source?: string | null
          wheelchair_access?: string | null
          zone_type?: string | null
        }
        Update: {
          access_conditions?: string | null
          adapted_bathroom?: boolean
          address_id?: string
          allowed_visit_hours?: string | null
          ambulance_access?: string | null
          animals_behavior?: string | null
          area_risk_type?: string | null
          backup_power_desc?: string | null
          backup_power_source?: string | null
          bed_type?: string | null
          block_tower?: string | null
          cell_signal_quality?: string | null
          concierge_contact?: string | null
          condo_name?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          distance_km?: number | null
          electric_voltage?: string | null
          elevator_status?: string | null
          entry_procedure?: string | null
          equipment_space?: string | null
          external_stairs?: string | null
          facade_image_url?: string | null
          floor_number?: number | null
          gate_identification?: string | null
          general_observations?: string | null
          has_24h_concierge?: boolean
          has_smokers?: boolean
          has_wifi?: boolean
          hygiene_conditions?: string | null
          lighting_quality?: string | null
          mattress_type?: string | null
          night_access_risk?: string | null
          noise_level?: string | null
          parking?: string | null
          pets_description?: string | null
          power_outlets_desc?: string | null
          property_type?: string | null
          street_access_type?: string | null
          team_parking?: string | null
          tenant_id?: string
          travel_notes?: string | null
          travel_time_min?: number | null
          unit_number?: string | null
          updated_at?: string
          updated_by?: string | null
          ventilation?: string | null
          water_source?: string | null
          wheelchair_access?: string | null
          zone_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_address_logistics_address_id_fkey"
            columns: ["address_id"]
            referencedRelation: "patient_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_related_persons: {
        Row: {
          access_to_home: boolean
          address_city: string | null
          address_full: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_summary: string | null
          allow_admin_notif: boolean
          allow_clinical_updates: boolean
          birth_date: string | null
          block_marketing: boolean
          can_authorize_clinical: boolean
          can_authorize_financial: boolean
          contact_time_preference: string | null
          contact_type: string | null
          cpf: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          id: string
          is_emergency_contact: boolean
          is_financial_responsible: boolean
          is_legal_guardian: boolean
          is_main_contact: boolean
          is_whatsapp: boolean
          lives_with_patient: string | null
          name: string
          observacoes_lgpd: string | null
          observations: string | null
          patient_id: string
          phone_primary: string | null
          phone_secondary: string | null
          preferred_contact: string | null
          priority_order: number
          relation_description: string | null
          relationship_degree: string | null
          rg: string | null
          rg_issuer: string | null
          rg_state: string | null
          role_type: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
          visit_frequency: string | null
        }
        Insert: {
          access_to_home?: boolean
          address_city?: string | null
          address_full?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_summary?: string | null
          allow_admin_notif?: boolean
          allow_clinical_updates?: boolean
          birth_date?: string | null
          block_marketing?: boolean
          can_authorize_clinical?: boolean
          can_authorize_financial?: boolean
          contact_time_preference?: string | null
          contact_type?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_emergency_contact?: boolean
          is_financial_responsible?: boolean
          is_legal_guardian?: boolean
          is_main_contact?: boolean
          is_whatsapp?: boolean
          lives_with_patient?: string | null
          name: string
          observacoes_lgpd?: string | null
          observations?: string | null
          patient_id: string
          phone_primary?: string | null
          phone_secondary?: string | null
          preferred_contact?: string | null
          priority_order?: number
          relation_description?: string | null
          relationship_degree?: string | null
          rg?: string | null
          rg_issuer?: string | null
          rg_state?: string | null
          role_type?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          visit_frequency?: string | null
        }
        Update: {
          access_to_home?: boolean
          address_city?: string | null
          address_full?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_summary?: string | null
          allow_admin_notif?: boolean
          allow_clinical_updates?: boolean
          birth_date?: string | null
          block_marketing?: boolean
          can_authorize_clinical?: boolean
          can_authorize_financial?: boolean
          contact_time_preference?: string | null
          contact_type?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_emergency_contact?: boolean
          is_financial_responsible?: boolean
          is_legal_guardian?: boolean
          is_main_contact?: boolean
          is_whatsapp?: boolean
          lives_with_patient?: string | null
          name?: string
          observacoes_lgpd?: string | null
          observations?: string | null
          patient_id?: string
          phone_primary?: string | null
          phone_secondary?: string | null
          preferred_contact?: string | null
          priority_order?: number
          relation_description?: string | null
          relationship_degree?: string | null
          rg?: string | null
          rg_issuer?: string | null
          rg_state?: string | null
          role_type?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          visit_frequency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_related_persons_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_household_members: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          name: string
          patient_id: string
          role: string
          schedule_note: string | null
          tenant_id: string
          type: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          name: string
          patient_id: string
          role: string
          schedule_note?: string | null
          tenant_id?: string
          type: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          name?: string
          patient_id?: string
          role?: string
          schedule_note?: string | null
          tenant_id?: string
          type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_household_members_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      care_team_members: {
        Row: {
          contact_email: string | null
          contact_info_override: string | null
          contact_phone: string | null
          corporate_cell: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          employment_type: string | null
          end_date: string | null
          id: string
          internal_extension: string | null
          is_family_focal_point: boolean
          is_reference_professional: boolean
          is_technical_responsible: boolean
          notes: string | null
          patient_id: string
          professional_category: string | null
          professional_id: string | null
          profissional_nome: string | null
          regime: string | null
          role_in_case: string
          start_date: string
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
          user_profile_id: string | null
          work_window: string | null
          work_window_summary: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_info_override?: string | null
          contact_phone?: string | null
          corporate_cell?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          internal_extension?: string | null
          is_family_focal_point?: boolean
          is_reference_professional?: boolean
          is_technical_responsible?: boolean
          notes?: string | null
          patient_id: string
          professional_category?: string | null
          professional_id?: string | null
          profissional_nome?: string | null
          regime?: string | null
          role_in_case: string
          start_date?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          user_profile_id?: string | null
          work_window?: string | null
          work_window_summary?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_info_override?: string | null
          contact_phone?: string | null
          corporate_cell?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          internal_extension?: string | null
          is_family_focal_point?: boolean
          is_reference_professional?: boolean
          is_technical_responsible?: boolean
          notes?: string | null
          patient_id?: string
          professional_category?: string | null
          professional_id?: string | null
          profissional_nome?: string | null
          regime?: string | null
          role_in_case?: string
          start_date?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          user_profile_id?: string | null
          work_window?: string | null
          work_window_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "care_team_members_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_documents: {
        Row: {
          admin_contract_id: string | null
          admin_fin_visible: boolean
          category: string
          clinical_event_id: string | null
          clinical_evolution_id: string | null
          clinical_visit_id: string | null
          clinical_visible: boolean
          contract_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          document_status: string
          document_validation_payload: Json | null
          domain_type: string | null
          extension: string | null
          external_ref: string | null
          external_signature_id: string | null
          file_extension: string | null
          file_hash: string | null
          file_name: string
          file_name_original: string | null
          file_path: string
          file_size_bytes: number | null
          finance_entry_id: string | null
          financial_record_id: string | null
          id: string
          internal_notes: string | null
          is_confidential: boolean
          is_verified: boolean
          is_visible_admin: boolean
          is_visible_clinical: boolean
          last_updated_at: string
          last_updated_by: string | null
          mime_type: string | null
          min_access_role: string | null
          min_role_level: string | null
          origin_module: string | null
          original_file_name: string | null
          patient_id: string
          previous_document_id: string | null
          prescription_id: string | null
          public_notes: string | null
          related_object_id: string | null
          signature_date: string | null
          signature_summary: string | null
          signature_type: string | null
          signed_at: string | null
          signers_summary: string | null
          source_module: string | null
          status: string | null
          storage_path: string | null
          storage_provider: string | null
          subcategory: string | null
          tags: string[] | null
          tenant_id: string
          title: string
          updated_at: string
          updated_by: string | null
          uploaded_at: string
          uploaded_by: string | null
          version: number
          verified_at: string | null
          verified_by: string | null
          expires_at: string | null
        }
        Insert: {
          admin_contract_id?: string | null
          admin_fin_visible?: boolean
          category: string
          clinical_event_id?: string | null
          clinical_evolution_id?: string | null
          clinical_visit_id?: string | null
          clinical_visible?: boolean
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          document_status?: string
          document_validation_payload?: Json | null
          domain_type?: string | null
          extension?: string | null
          external_ref?: string | null
          external_signature_id?: string | null
          file_extension?: string | null
          file_hash?: string | null
          file_name: string
          file_name_original?: string | null
          file_path: string
          file_size_bytes?: number | null
          finance_entry_id?: string | null
          financial_record_id?: string | null
          id?: string
          internal_notes?: string | null
          is_confidential?: boolean
          is_verified?: boolean
          is_visible_admin?: boolean
          is_visible_clinical?: boolean
          last_updated_at?: string
          last_updated_by?: string | null
          mime_type?: string | null
          min_access_role?: string | null
          min_role_level?: string | null
          origin_module?: string | null
          original_file_name?: string | null
          patient_id: string
          previous_document_id?: string | null
          prescription_id?: string | null
          public_notes?: string | null
          related_object_id?: string | null
          signature_date?: string | null
          signature_summary?: string | null
          signature_type?: string | null
          signed_at?: string | null
          signers_summary?: string | null
          source_module?: string | null
          status?: string | null
          storage_path?: string | null
          storage_provider?: string | null
          subcategory?: string | null
          tags?: string[] | null
          tenant_id?: string
          title: string
          updated_at?: string
          updated_by?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
          version?: number
          verified_at?: string | null
          verified_by?: string | null
          expires_at?: string | null
        }
        Update: {
          admin_contract_id?: string | null
          admin_fin_visible?: boolean
          category?: string
          clinical_event_id?: string | null
          clinical_evolution_id?: string | null
          clinical_visit_id?: string | null
          clinical_visible?: boolean
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          document_status?: string
          document_validation_payload?: Json | null
          domain_type?: string | null
          extension?: string | null
          external_ref?: string | null
          external_signature_id?: string | null
          file_extension?: string | null
          file_hash?: string | null
          file_name?: string
          file_name_original?: string | null
          file_path?: string
          file_size_bytes?: number | null
          finance_entry_id?: string | null
          financial_record_id?: string | null
          id?: string
          internal_notes?: string | null
          is_confidential?: boolean
          is_verified?: boolean
          is_visible_admin?: boolean
          is_visible_clinical?: boolean
          last_updated_at?: string
          last_updated_by?: string | null
          mime_type?: string | null
          min_access_role?: string | null
          min_role_level?: string | null
          origin_module?: string | null
          original_file_name?: string | null
          patient_id?: string
          previous_document_id?: string | null
          prescription_id?: string | null
          public_notes?: string | null
          related_object_id?: string | null
          signature_date?: string | null
          signature_summary?: string | null
          signature_type?: string | null
          signed_at?: string | null
          signers_summary?: string | null
          source_module?: string | null
          status?: string | null
          storage_path?: string | null
          storage_provider?: string | null
          subcategory?: string | null
          tags?: string[] | null
          tenant_id?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
          version?: number
          verified_at?: string | null
          verified_by?: string | null
          expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_documents_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_document_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          document_id: string
          happened_at: string
          id: string
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          document_id: string
          happened_at?: string
          id?: string
          tenant_id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          document_id?: string
          happened_at?: string
          id?: string
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_document_logs_document_id_fkey"
            columns: ["document_id"]
            referencedRelation: "patient_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_portal_access: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          invite_expires_at: string | null
          invite_token: string
          invited_at: string
          invited_by: string | null
          last_login_at: string | null
          patient_id: string
          portal_access_level: string
          related_person_id: string
          revoked_at: string | null
          revoked_by: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          invite_expires_at?: string | null
          invite_token: string
          invited_at?: string
          invited_by?: string | null
          last_login_at?: string | null
          patient_id: string
          portal_access_level?: string
          related_person_id: string
          revoked_at?: string | null
          revoked_by?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          invite_expires_at?: string | null
          invite_token?: string
          invited_at?: string
          invited_by?: string | null
          last_login_at?: string | null
          patient_id?: string
          portal_access_level?: string
          related_person_id?: string
          revoked_at?: string | null
          revoked_by?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_portal_access_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_portal_access_related_person_id_fkey"
            columns: ["related_person_id"]
            referencedRelation: "patient_related_persons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      view_patient_legal_guardian_summary: {
        Row: {
          has_legal_guardian: boolean
          legal_doc_status: string | null
          legal_guardian_name: string
          legal_guardian_phone: string | null
          legal_guardian_relationship: string | null
          patient_id: string
          related_person_id: string
          updated_at: string
        }
        Relationships: []
      }
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
