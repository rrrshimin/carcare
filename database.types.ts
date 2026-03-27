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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      company_profiles: {
        Row: {
          id: string
          auth_user_id: string
          company_name: string
          billing_email: string
          business_address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          company_name: string
          billing_email: string
          business_address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string
          company_name?: string
          billing_email?: string
          business_address?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      log_categories: {
        Row: {
          category_name: string | null
          id: number
          image_url: string | null
        }
        Insert: {
          category_name?: string | null
          id?: number
          image_url?: string | null
        }
        Update: {
          category_name?: string | null
          id?: number
          image_url?: string | null
        }
        Relationships: []
      }
      log_types: {
        Row: {
          applicable_fuel_types: string[] | null
          applicable_transmissions: string[] | null
          base_due: number | null
          category_link: number | null
          diesel_increment: number | null
          due_type: string | null
          hybrid_increment: number | null
          id: number
          log_type_name: string | null
          spec_name: string | null
          spec_placeholder: string | null
        }
        Insert: {
          applicable_fuel_types?: string[] | null
          applicable_transmissions?: string[] | null
          base_due?: number | null
          category_link?: number | null
          diesel_increment?: number | null
          due_type?: string | null
          hybrid_increment?: number | null
          id?: number
          log_type_name?: string | null
          spec_name?: string | null
          spec_placeholder?: string | null
        }
        Update: {
          applicable_fuel_types?: string[] | null
          applicable_transmissions?: string[] | null
          base_due?: number | null
          category_link?: number | null
          diesel_increment?: number | null
          due_type?: string | null
          hybrid_increment?: number | null
          id?: number
          log_type_name?: string | null
          spec_name?: string | null
          spec_placeholder?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "log_types_category_link_fkey"
            columns: ["category_link"]
            isOneToOne: false
            referencedRelation: "log_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_requests: {
        Row: {
          created_at: string
          id: number
          recipient_auth_id: string
          resolved_at: string | null
          sender_auth_id: string
          status: string
          vehicle_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          recipient_auth_id: string
          resolved_at?: string | null
          sender_auth_id: string
          status?: string
          vehicle_id: number
        }
        Update: {
          created_at?: string
          id?: number
          recipient_auth_id?: string
          resolved_at?: string | null
          sender_auth_id?: string
          status?: string
          vehicle_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "transfer_requests_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_devices: {
        Row: {
          created_at: string
          currency_code: string | null
          device_id: string | null
          id: number
          subscription_status: string
          unit: string | null
        }
        Insert: {
          created_at?: string
          currency_code?: string | null
          device_id?: string | null
          id?: number
          subscription_status?: string
          unit?: string | null
        }
        Update: {
          created_at?: string
          currency_code?: string | null
          device_id?: string | null
          id?: number
          subscription_status?: string
          unit?: string | null
        }
        Relationships: []
      }
      user_logs: {
        Row: {
          car_id: number | null
          change_date: string | null
          cost_amount: number | null
          created_at: string
          created_by_auth_id: string | null
          id: number
          log_type: number | null
          notes: string | null
          odo_log: number | null
          specs: string | null
        }
        Insert: {
          car_id?: number | null
          change_date?: string | null
          cost_amount?: number | null
          created_at?: string
          created_by_auth_id?: string | null
          id?: number
          log_type?: number | null
          notes?: string | null
          odo_log?: number | null
          specs?: string | null
        }
        Update: {
          car_id?: number | null
          change_date?: string | null
          cost_amount?: number | null
          created_at?: string
          created_by_auth_id?: string | null
          id?: number
          log_type?: number | null
          notes?: string | null
          odo_log?: number | null
          specs?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_logs_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_logs_log_type_fkey"
            columns: ["log_type"]
            isOneToOne: false
            referencedRelation: "log_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          auth_user_id: string
          created_at: string
          id: string
          public_id: string | null
          updated_at: string
          username: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          id?: string
          public_id?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          id?: string
          public_id?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          auth_user_id: string | null
          created_at: string
          current_odometer: number | null
          fuel_type: string | null
          id: number
          image_url: string | null
          is_active: boolean
          name: string | null
          shared_link: string | null
          transmission: string | null
          user_id_link: string | null
          year: number | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          current_odometer?: number | null
          fuel_type?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean
          name?: string | null
          shared_link?: string | null
          transmission?: string | null
          user_id_link?: string | null
          year?: number | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          current_odometer?: number | null
          fuel_type?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean
          name?: string | null
          shared_link?: string | null
          transmission?: string | null
          user_id_link?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_user_id_link_fkey"
            columns: ["user_id_link"]
            isOneToOne: false
            referencedRelation: "user_devices"
            referencedColumns: ["device_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_transfer_request: {
        Args: { p_request_id: number }
        Returns: undefined
      }
      claim_guest_vehicles: {
        Args: { p_device_id: string }
        Returns: undefined
      }
      create_device: {
        Args: { p_device_id: string }
        Returns: {
          created_at: string
          device_id: string | null
          id: number
          subscription_status: string
          unit: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "user_devices"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      create_guest_log: {
        Args: {
          p_car_id: number
          p_change_date?: string
          p_cost_amount?: number
          p_device_id: string
          p_log_type: number
          p_notes?: string
          p_odo_log?: number
          p_specs?: string
        }
        Returns: {
          car_id: number | null
          change_date: string | null
          cost_amount: number | null
          created_at: string
          created_by_auth_id: string | null
          id: number
          log_type: number | null
          notes: string | null
          odo_log: number | null
          specs: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "user_logs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      create_guest_vehicle: {
        Args: {
          p_current_odometer: number
          p_device_id: string
          p_fuel_type: string
          p_image_url?: string
          p_name: string
          p_transmission: string
          p_year: number
        }
        Returns: {
          auth_user_id: string | null
          created_at: string
          current_odometer: number | null
          fuel_type: string | null
          id: number
          image_url: string | null
          is_active: boolean
          name: string | null
          shared_link: string | null
          transmission: string | null
          user_id_link: string | null
          year: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "vehicles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      create_transfer_request: {
        Args: { p_recipient_profile_id: string; p_vehicle_id: number }
        Returns: number
      }
      delete_guest_log: {
        Args: { p_device_id: string; p_log_id: number }
        Returns: undefined
      }
      delete_guest_vehicle: {
        Args: { p_device_id: string; p_vehicle_id: number }
        Returns: undefined
      }
      get_device: {
        Args: { p_device_id: string }
        Returns: {
          created_at: string
          device_id: string | null
          id: number
          subscription_status: string
          unit: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "user_devices"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_guest_logs: {
        Args: { p_device_id: string; p_vehicle_id: number }
        Returns: {
          car_id: number | null
          change_date: string | null
          cost_amount: number | null
          created_at: string
          created_by_auth_id: string | null
          id: number
          log_type: number | null
          notes: string | null
          odo_log: number | null
          specs: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "user_logs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_guest_logs_by_type: {
        Args: {
          p_device_id: string
          p_log_type_id: number
          p_vehicle_id: number
        }
        Returns: {
          car_id: number | null
          change_date: string | null
          cost_amount: number | null
          created_at: string
          created_by_auth_id: string | null
          id: number
          log_type: number | null
          notes: string | null
          odo_log: number | null
          specs: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "user_logs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_guest_vehicle: {
        Args: { p_device_id: string; p_vehicle_id: number }
        Returns: {
          auth_user_id: string | null
          created_at: string
          current_odometer: number | null
          fuel_type: string | null
          id: number
          image_url: string | null
          is_active: boolean
          name: string | null
          shared_link: string | null
          transmission: string | null
          user_id_link: string | null
          year: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "vehicles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_guest_vehicles: {
        Args: { p_device_id: string }
        Returns: {
          auth_user_id: string | null
          created_at: string
          current_odometer: number | null
          fuel_type: string | null
          id: number
          image_url: string | null
          is_active: boolean
          name: string | null
          shared_link: string | null
          transmission: string | null
          user_id_link: string | null
          year: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "vehicles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_incoming_transfer_requests: {
        Args: never
        Returns: {
          created_at: string
          request_id: number
          sender_username: string
          vehicle_id: number
          vehicle_image_url: string
          vehicle_name: string
          vehicle_year: number
        }[]
      }
      get_shared_vehicle: {
        Args: { p_slug: string }
        Returns: {
          auth_user_id: string | null
          created_at: string
          current_odometer: number | null
          fuel_type: string | null
          id: number
          image_url: string | null
          is_active: boolean
          name: string | null
          shared_link: string | null
          transmission: string | null
          user_id_link: string | null
          year: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "vehicles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_shared_vehicle_logs: {
        Args: { p_slug: string }
        Returns: {
          car_id: number | null
          change_date: string | null
          created_at: string
          created_by_auth_id: string | null
          id: number
          log_type: number | null
          notes: string | null
          odo_log: number | null
          specs: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "user_logs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_vehicle_pending_transfer: {
        Args: { p_vehicle_id: number }
        Returns: {
          created_at: string
          recipient_username: string
          request_id: number
        }[]
      }
      lookup_recipient: {
        Args: { p_profile_id: string }
        Returns: {
          profile_auth_id: string
          username: string
        }[]
      }
      respond_to_transfer_request: {
        Args: { p_accept: boolean; p_request_id: number }
        Returns: undefined
      }
      set_guest_share_link: {
        Args: { p_device_id: string; p_slug?: string; p_vehicle_id: number }
        Returns: {
          auth_user_id: string | null
          created_at: string
          current_odometer: number | null
          fuel_type: string | null
          id: number
          image_url: string | null
          is_active: boolean
          name: string | null
          shared_link: string | null
          transmission: string | null
          user_id_link: string | null
          year: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "vehicles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_device_subscription: {
        Args: { p_device_id: string; p_status: string }
        Returns: undefined
      }
      update_device_currency: {
        Args: { p_device_id: string; p_currency_code: string }
        Returns: undefined
      }
      update_device_unit: {
        Args: { p_device_id: string; p_unit: string }
        Returns: undefined
      }
      update_guest_vehicle_odometer: {
        Args: { p_device_id: string; p_odometer: number; p_vehicle_id: number }
        Returns: {
          auth_user_id: string | null
          created_at: string
          current_odometer: number | null
          fuel_type: string | null
          id: number
          image_url: string | null
          is_active: boolean
          name: string | null
          shared_link: string | null
          transmission: string | null
          user_id_link: string | null
          year: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "vehicles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      update_guest_vehicle_profile: {
        Args: {
          p_device_id: string
          p_image_url?: string
          p_name?: string
          p_vehicle_id: number
        }
        Returns: {
          auth_user_id: string | null
          created_at: string
          current_odometer: number | null
          fuel_type: string | null
          id: number
          image_url: string | null
          is_active: boolean
          name: string | null
          shared_link: string | null
          transmission: string | null
          user_id_link: string | null
          year: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "vehicles"
          isOneToOne: false
          isSetofReturn: true
        }
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
  public: {
    Enums: {},
  },
} as const
