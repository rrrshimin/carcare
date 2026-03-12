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
      user_devices: {
        Row: {
          created_at: string
          device_id: string | null
          id: number
          subscription_status: string
          unit: string | null
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          id?: number
          subscription_status?: string
          unit?: string | null
        }
        Update: {
          created_at?: string
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
          created_at: string
          id: number
          log_type: number | null
          notes: string | null
          odo_log: number | null
          specs: string | null
        }
        Insert: {
          car_id?: number | null
          change_date?: string | null
          created_at?: string
          id?: number
          log_type?: number | null
          notes?: string | null
          odo_log?: number | null
          specs?: string | null
        }
        Update: {
          car_id?: number | null
          change_date?: string | null
          created_at?: string
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
      vehicles: {
        Row: {
          created_at: string
          current_odometer: number | null
          fuel_type: string | null
          id: number
          image_url: string | null
          name: string | null
          shared_link: string | null
          transmission: string | null
          user_id_link: string | null
          year: number | null
        }
        Insert: {
          created_at?: string
          current_odometer?: number | null
          fuel_type?: string | null
          id?: number
          image_url?: string | null
          name?: string | null
          shared_link?: string | null
          transmission?: string | null
          user_id_link?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string
          current_odometer?: number | null
          fuel_type?: string | null
          id?: number
          image_url?: string | null
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
  public: {
    Enums: {},
  },
} as const
