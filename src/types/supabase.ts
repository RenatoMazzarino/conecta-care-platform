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
          is_payer: boolean
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
          is_payer?: boolean
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
          is_payer?: boolean
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
      billing_entities: {
        Row: {
          billing_address_cep: string | null
          billing_address_city: string | null
          billing_address_neighborhood: string | null
          billing_address_number: string | null
          billing_address_state: string | null
          billing_address_street: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          doc_number: string | null
          doc_type: string | null
          id: string
          kind: string
          legal_name: string | null
          name: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          billing_address_cep?: string | null
          billing_address_city?: string | null
          billing_address_neighborhood?: string | null
          billing_address_number?: string | null
          billing_address_state?: string | null
          billing_address_street?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          doc_number?: string | null
          doc_type?: string | null
          id?: string
          kind: string
          legal_name?: string | null
          name: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          billing_address_cep?: string | null
          billing_address_city?: string | null
          billing_address_neighborhood?: string | null
          billing_address_number?: string | null
          billing_address_state?: string | null
          billing_address_street?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          doc_number?: string | null
          doc_type?: string | null
          id?: string
          kind?: string
          legal_name?: string | null
          name?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      care_policy_profiles: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_default: boolean
          name: string
          rule_set: Json
          tenant_id: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
          rule_set: Json
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          rule_set?: Json
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: []
      }
      patient_admin_financial_profile: {
        Row: {
          acquisition_channel: string | null
          admission_date: string | null
          admission_source: string | null
          admission_type: string | null
          admin_notes: string | null
          administrative_status: string
          administrative_status_changed_at: string | null
          administrative_status_reason: string | null
          authorization_number: string | null
          billing_base_value: number | null
          billing_due_day: number | null
          billing_model: string | null
          billing_periodicity: string | null
          billing_status: string | null
          bond_type: string | null
          card_holder_name: string | null
          checklist_complete: boolean
          checklist_notes: string | null
          commercial_responsible_id: string | null
          contract_category: string | null
          contract_end_date: string | null
          contract_id: string | null
          contract_manager_id: string | null
          contract_start_date: string | null
          contract_status: string | null
          contract_status_reason: string | null
          copay_percent: number | null
          cost_center_id: string | null
          created_at: string
          created_by: string | null
          daily_interest_percent: number | null
          deleted_at: string | null
          demand_origin: string | null
          demand_origin_description: string | null
          discharge_date: string | null
          discharge_prediction_date: string | null
          discount_days_limit: number | null
          discount_early_payment: number | null
          erp_case_code: string | null
          external_contract_id: string | null
          financial_notes: string | null
          financial_responsible_contact: string | null
          financial_responsible_name: string | null
          grace_period_days: number | null
          insurance_card_number: string | null
          insurance_card_validity: string | null
          insurer_name: string | null
          invoice_delivery_method: string | null
          judicial_case_number: string | null
          late_fee_percent: number | null
          monthly_fee: number | null
          official_letter_number: string | null
          payer_admin_contact_description: string | null
          payer_admin_contact_id: string | null
          payer_relation: string | null
          payment_method: string | null
          payment_terms: string | null
          patient_id: string
          plan_name: string | null
          policy_profile_id: string | null
          primary_payer_entity_id: string | null
          primary_payer_related_person_id: string | null
          readjustment_index: string | null
          readjustment_month: number | null
          receiving_account_info: string | null
          renewal_type: string | null
          service_package_description: string | null
          service_package_name: string | null
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          acquisition_channel?: string | null
          admission_date?: string | null
          admission_source?: string | null
          admission_type?: string | null
          admin_notes?: string | null
          administrative_status?: string
          administrative_status_changed_at?: string | null
          administrative_status_reason?: string | null
          authorization_number?: string | null
          billing_base_value?: number | null
          billing_due_day?: number | null
          billing_model?: string | null
          billing_periodicity?: string | null
          billing_status?: string | null
          bond_type?: string | null
          card_holder_name?: string | null
          checklist_complete?: boolean
          checklist_notes?: string | null
          commercial_responsible_id?: string | null
          contract_category?: string | null
          contract_end_date?: string | null
          contract_id?: string | null
          contract_manager_id?: string | null
          contract_start_date?: string | null
          contract_status?: string | null
          contract_status_reason?: string | null
          copay_percent?: number | null
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          daily_interest_percent?: number | null
          deleted_at?: string | null
          demand_origin?: string | null
          demand_origin_description?: string | null
          discharge_date?: string | null
          discharge_prediction_date?: string | null
          discount_days_limit?: number | null
          discount_early_payment?: number | null
          erp_case_code?: string | null
          external_contract_id?: string | null
          financial_notes?: string | null
          financial_responsible_contact?: string | null
          financial_responsible_name?: string | null
          grace_period_days?: number | null
          insurance_card_number?: string | null
          insurance_card_validity?: string | null
          insurer_name?: string | null
          invoice_delivery_method?: string | null
          judicial_case_number?: string | null
          late_fee_percent?: number | null
          monthly_fee?: number | null
          official_letter_number?: string | null
          payer_admin_contact_description?: string | null
          payer_admin_contact_id?: string | null
          payer_relation?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          patient_id: string
          plan_name?: string | null
          policy_profile_id?: string | null
          primary_payer_entity_id?: string | null
          primary_payer_related_person_id?: string | null
          readjustment_index?: string | null
          readjustment_month?: number | null
          receiving_account_info?: string | null
          renewal_type?: string | null
          service_package_description?: string | null
          service_package_name?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          acquisition_channel?: string | null
          admission_date?: string | null
          admission_source?: string | null
          admission_type?: string | null
          admin_notes?: string | null
          administrative_status?: string
          administrative_status_changed_at?: string | null
          administrative_status_reason?: string | null
          authorization_number?: string | null
          billing_base_value?: number | null
          billing_due_day?: number | null
          billing_model?: string | null
          billing_periodicity?: string | null
          billing_status?: string | null
          bond_type?: string | null
          card_holder_name?: string | null
          checklist_complete?: boolean
          checklist_notes?: string | null
          commercial_responsible_id?: string | null
          contract_category?: string | null
          contract_end_date?: string | null
          contract_id?: string | null
          contract_manager_id?: string | null
          contract_start_date?: string | null
          contract_status?: string | null
          contract_status_reason?: string | null
          copay_percent?: number | null
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          daily_interest_percent?: number | null
          deleted_at?: string | null
          demand_origin?: string | null
          demand_origin_description?: string | null
          discharge_date?: string | null
          discharge_prediction_date?: string | null
          discount_days_limit?: number | null
          discount_early_payment?: number | null
          erp_case_code?: string | null
          external_contract_id?: string | null
          financial_notes?: string | null
          financial_responsible_contact?: string | null
          financial_responsible_name?: string | null
          grace_period_days?: number | null
          insurance_card_number?: string | null
          insurance_card_validity?: string | null
          insurer_name?: string | null
          invoice_delivery_method?: string | null
          judicial_case_number?: string | null
          late_fee_percent?: number | null
          monthly_fee?: number | null
          official_letter_number?: string | null
          payer_admin_contact_description?: string | null
          payer_admin_contact_id?: string | null
          payer_relation?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          patient_id?: string
          plan_name?: string | null
          policy_profile_id?: string | null
          primary_payer_entity_id?: string | null
          primary_payer_related_person_id?: string | null
          readjustment_index?: string | null
          readjustment_month?: number | null
          receiving_account_info?: string | null
          renewal_type?: string | null
          service_package_description?: string | null
          service_package_name?: string | null
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_admin_financial_profile_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_admin_financial_profile_policy_profile_id_fkey"
            columns: ["policy_profile_id"]
            referencedRelation: "care_policy_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_admin_financial_profile_primary_payer_entity_id_fkey"
            columns: ["primary_payer_entity_id"]
            referencedRelation: "billing_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_admin_financial_profile_payer_admin_contact_id_fkey"
            columns: ["payer_admin_contact_id"]
            referencedRelation: "patient_related_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_admin_financial_profile_primary_payer_related_person_id_fkey"
            columns: ["primary_payer_related_person_id"]
            referencedRelation: "patient_related_persons"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_onboarding_checklist: {
        Row: {
          completed_at: string | null
          completed_by_label: string | null
          completed_by_user_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          document_id: string | null
          id: string
          is_completed: boolean
          item_code: string
          item_description: string | null
          patient_id: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by_label?: string | null
          completed_by_user_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_id?: string | null
          id?: string
          is_completed?: boolean
          item_code: string
          item_description?: string | null
          patient_id: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by_label?: string | null
          completed_by_user_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_id?: string | null
          id?: string
          is_completed?: boolean
          item_code?: string
          item_description?: string | null
          patient_id?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_onboarding_checklist_document_id_fkey"
            columns: ["document_id"]
            referencedRelation: "patient_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_onboarding_checklist_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_timeline_events: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          event_category: string | null
          event_time: string
          event_type: string
          id: string
          payload: Json | null
          patient_id: string
          tenant_id: string
          title: string | null
          tone: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          event_category?: string | null
          event_time?: string
          event_type: string
          id?: string
          payload?: Json | null
          patient_id: string
          tenant_id?: string
          title?: string | null
          tone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          event_category?: string | null
          event_time?: string
          event_type?: string
          id?: string
          payload?: Json | null
          patient_id?: string
          tenant_id?: string
          title?: string | null
          tone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_timeline_events_patient_id_fkey"
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
          folder_id: string | null
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
          folder_id?: string | null
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
          folder_id?: string | null
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
          {
            foreignKeyName: "patient_documents_folder_id_fkey"
            columns: ["folder_id"]
            referencedRelation: "patient_ged_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_ged_folders: {
        Row: {
          created_at: string
          deleted_at: string | null
          depth: number
          id: string
          is_system: boolean
          name: string
          name_norm: string
          parent_id: string | null
          path: string
          patient_id: string
          sort_order: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          depth?: number
          id?: string
          is_system?: boolean
          name: string
          name_norm?: string
          parent_id?: string | null
          path?: string
          patient_id: string
          sort_order?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          depth?: number
          id?: string
          is_system?: boolean
          name?: string
          name_norm?: string
          parent_id?: string | null
          path?: string
          patient_id?: string
          sort_order?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_ged_folders_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "patient_ged_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_ged_folders_patient_id_fkey"
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
      document_artifacts: {
        Row: {
          artifact_type: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          document_id: string
          document_log_id: string
          file_hash: string
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          patient_id: string
          storage_path: string
          tenant_id: string
        }
        Insert: {
          artifact_type?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_id: string
          document_log_id: string
          file_hash: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          patient_id: string
          storage_path: string
          tenant_id?: string
        }
        Update: {
          artifact_type?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_id?: string
          document_log_id?: string
          file_hash?: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          patient_id?: string
          storage_path?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_artifacts_document_id_fkey"
            columns: ["document_id"]
            referencedRelation: "patient_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_artifacts_document_log_id_fkey"
            columns: ["document_log_id"]
            referencedRelation: "patient_document_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_artifacts_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      document_time_stamps: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          document_hash: string
          document_id: string
          id: string
          issued_at: string
          provider: string
          receipt_payload: Json
          tenant_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_hash: string
          document_id: string
          id?: string
          issued_at: string
          provider?: string
          receipt_payload: Json
          tenant_id?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_hash?: string
          document_id?: string
          id?: string
          issued_at?: string
          provider?: string
          receipt_payload?: Json
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_time_stamps_document_id_fkey"
            columns: ["document_id"]
            referencedRelation: "patient_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_secure_links: {
        Row: {
          consumed_at: string | null
          consumed_by: string | null
          created_at: string
          deleted_at: string | null
          document_id: string
          downloads_count: number
          expires_at: string
          id: string
          issued_at: string | null
          issued_by: string | null
          last_accessed_at: string | null
          max_downloads: number
          metadata: Json | null
          requested_at: string | null
          requested_by: string | null
          revoked_at: string | null
          revoked_by: string | null
          tenant_id: string
          token_hash: string
        }
        Insert: {
          consumed_at?: string | null
          consumed_by?: string | null
          created_at?: string
          deleted_at?: string | null
          document_id: string
          downloads_count?: number
          expires_at: string
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          last_accessed_at?: string | null
          max_downloads?: number
          metadata?: Json | null
          requested_at?: string | null
          requested_by?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          tenant_id?: string
          token_hash: string
        }
        Update: {
          consumed_at?: string | null
          consumed_by?: string | null
          created_at?: string
          deleted_at?: string | null
          document_id?: string
          downloads_count?: number
          expires_at?: string
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          last_accessed_at?: string | null
          max_downloads?: number
          metadata?: Json | null
          requested_at?: string | null
          requested_by?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          tenant_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_secure_links_document_id_fkey"
            columns: ["document_id"]
            referencedRelation: "patient_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      ged_original_requests: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          notes: string | null
          patient_id: string
          requested_by_user_id: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          requested_by_user_id: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          requested_by_user_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ged_original_requests_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      ged_original_request_items: {
        Row: {
          created_at: string
          deleted_at: string | null
          document_id: string
          id: string
          request_id: string
          secure_link_id: string | null
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          document_id: string
          id?: string
          request_id: string
          secure_link_id?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          document_id?: string
          id?: string
          request_id?: string
          secure_link_id?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ged_original_request_items_document_id_fkey"
            columns: ["document_id"]
            referencedRelation: "patient_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ged_original_request_items_request_id_fkey"
            columns: ["request_id"]
            referencedRelation: "ged_original_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ged_original_request_items_secure_link_id_fkey"
            columns: ["secure_link_id"]
            referencedRelation: "document_secure_links"
            referencedColumns: ["id"]
          },
        ]
      }
      document_import_jobs: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          failed_items: number
          finished_at: string | null
          id: string
          manifest_path: string | null
          manifest_type: string | null
          metadata: Json | null
          needs_review_items: number
          patient_id: string | null
          processed_items: number
          source: string
          started_at: string | null
          status: string
          tenant_id: string
          total_items: number
          zip_storage_path: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          failed_items?: number
          finished_at?: string | null
          id?: string
          manifest_path?: string | null
          manifest_type?: string | null
          metadata?: Json | null
          needs_review_items?: number
          patient_id?: string | null
          processed_items?: number
          source?: string
          started_at?: string | null
          status?: string
          tenant_id?: string
          total_items?: number
          zip_storage_path: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          failed_items?: number
          finished_at?: string | null
          id?: string
          manifest_path?: string | null
          manifest_type?: string | null
          metadata?: Json | null
          needs_review_items?: number
          patient_id?: string | null
          processed_items?: number
          source?: string
          started_at?: string | null
          status?: string
          tenant_id?: string
          total_items?: number
          zip_storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_import_jobs_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      document_import_job_items: {
        Row: {
          attempts: number
          checksum_sha256: string | null
          created_at: string
          deleted_at: string | null
          document_id: string | null
          error_code: string | null
          error_detail: string | null
          file_path: string
          file_size_bytes: number | null
          id: string
          inferred_taxonomy: Json | null
          job_id: string
          manifest_payload: Json | null
          mime_type: string | null
          original_file_name: string | null
          patient_id: string | null
          processed_at: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          attempts?: number
          checksum_sha256?: string | null
          created_at?: string
          deleted_at?: string | null
          document_id?: string | null
          error_code?: string | null
          error_detail?: string | null
          file_path: string
          file_size_bytes?: number | null
          id?: string
          inferred_taxonomy?: Json | null
          job_id: string
          manifest_payload?: Json | null
          mime_type?: string | null
          original_file_name?: string | null
          patient_id?: string | null
          processed_at?: string | null
          status?: string
          tenant_id?: string
        }
        Update: {
          attempts?: number
          checksum_sha256?: string | null
          created_at?: string
          deleted_at?: string | null
          document_id?: string | null
          error_code?: string | null
          error_detail?: string | null
          file_path?: string
          file_size_bytes?: number | null
          id?: string
          inferred_taxonomy?: Json | null
          job_id?: string
          manifest_payload?: Json | null
          mime_type?: string | null
          original_file_name?: string | null
          patient_id?: string | null
          processed_at?: string | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_import_job_items_document_id_fkey"
            columns: ["document_id"]
            referencedRelation: "patient_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_import_job_items_job_id_fkey"
            columns: ["job_id"]
            referencedRelation: "document_import_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_import_job_items_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "patients"
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
      create_ged_artifact_bundle: {
        Args: {
          p_artifact_id: string
          p_artifact_type: string
          p_created_by: string
          p_document_id: string
          p_file_hash: string
          p_file_size_bytes: number
          p_log_action: string
          p_log_details: Json
          p_mime_type: string
          p_patient_id: string
          p_storage_path: string
        }
        Returns: {
          artifact_id: string
          log_id: string
        }[]
      }
      create_ged_document_bundle: {
        Args: {
          p_category: string
          p_created_by: string
          p_doc_domain: string
          p_doc_origin: string
          p_doc_source: string
          p_doc_type: string
          p_document_id: string
          p_document_status?: string
          p_document_validation_payload?: Json | null
          p_extension: string
          p_file_extension: string
          p_file_hash: string
          p_file_name: string
          p_file_size_bytes: number
          p_folder_id: string | null
          p_log_action?: string
          p_log_details?: Json
          p_mime_type: string
          p_original_file_name: string
          p_patient_id: string
          p_status?: string
          p_storage_path: string
          p_storage_provider: string
          p_tags: string[] | null
          p_title: string
          p_uploaded_by: string
          p_description?: string | null
          p_tsa_issued_at: string
          p_tsa_payload: Json
          p_tsa_provider: string
        }
        Returns: string
      }
      move_ged_folder: {
        Args: {
          folder_id: string
          new_parent_id: string | null
        }
        Returns: undefined
      }
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
