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
      contracts: {
        Row: {
          created_at: string | null
          department: string | null
          documents_complete: boolean | null
          employee_id: string
          end_date: string | null
          id: string
          notes: string | null
          position: string | null
          salary: number | null
          start_date: string
          status: string | null
          type: Database["public"]["Enums"]["contract_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          documents_complete?: boolean | null
          employee_id: string
          end_date?: string | null
          id?: string
          notes?: string | null
          position?: string | null
          salary?: number | null
          start_date: string
          status?: string | null
          type: Database["public"]["Enums"]["contract_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          documents_complete?: boolean | null
          employee_id?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          position?: string | null
          salary?: number | null
          start_date?: string
          status?: string | null
          type?: Database["public"]["Enums"]["contract_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          avatar_url: string | null
          contract_end_date: string | null
          contract_type: Database["public"]["Enums"]["contract_type"] | null
          created_at: string | null
          department: string
          document_id: string
          email: string | null
          hire_date: string | null
          id: string
          name: string
          phone: string | null
          position: string | null
          status: Database["public"]["Enums"]["employee_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          contract_end_date?: string | null
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          created_at?: string | null
          department: string
          document_id: string
          email?: string | null
          hire_date?: string | null
          id?: string
          name: string
          phone?: string | null
          position?: string | null
          status?: Database["public"]["Enums"]["employee_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          contract_end_date?: string | null
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          created_at?: string | null
          department?: string
          document_id?: string
          email?: string | null
          hire_date?: string | null
          id?: string
          name?: string
          phone?: string | null
          position?: string | null
          status?: Database["public"]["Enums"]["employee_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      justifications: {
        Row: {
          created_at: string | null
          date: string
          dcts_validated: boolean | null
          dcts_validated_at: string | null
          dcts_validated_by: string | null
          description: string
          employee_id: string
          employee_name: string
          evidence_type: string | null
          evidence_url: string | null
          id: string
          jefe_approved: boolean | null
          jefe_approved_at: string | null
          jefe_approved_by: string | null
          rrhh_approved: boolean | null
          rrhh_approved_at: string | null
          rrhh_approved_by: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          type: Database["public"]["Enums"]["justification_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          dcts_validated?: boolean | null
          dcts_validated_at?: string | null
          dcts_validated_by?: string | null
          description: string
          employee_id: string
          employee_name: string
          evidence_type?: string | null
          evidence_url?: string | null
          id?: string
          jefe_approved?: boolean | null
          jefe_approved_at?: string | null
          jefe_approved_by?: string | null
          rrhh_approved?: boolean | null
          rrhh_approved_at?: string | null
          rrhh_approved_by?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          type: Database["public"]["Enums"]["justification_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          dcts_validated?: boolean | null
          dcts_validated_at?: string | null
          dcts_validated_by?: string | null
          description?: string
          employee_id?: string
          employee_name?: string
          evidence_type?: string | null
          evidence_url?: string | null
          id?: string
          jefe_approved?: boolean | null
          jefe_approved_at?: string | null
          jefe_approved_by?: string | null
          rrhh_approved?: boolean | null
          rrhh_approved_at?: string | null
          rrhh_approved_by?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          type?: Database["public"]["Enums"]["justification_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "justifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          category: string | null
          created_at: string | null
          department: string | null
          from_user_id: string
          from_user_name: string
          id: string
          message: string
          read_at: string | null
          replied: boolean | null
          resolved: boolean | null
          subject: string
          to_user_id: string | null
          to_user_name: string
          to_user_type: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          category?: string | null
          created_at?: string | null
          department?: string | null
          from_user_id: string
          from_user_name: string
          id?: string
          message: string
          read_at?: string | null
          replied?: boolean | null
          resolved?: boolean | null
          subject: string
          to_user_id?: string | null
          to_user_name: string
          to_user_type: string
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          category?: string | null
          created_at?: string | null
          department?: string | null
          from_user_id?: string
          from_user_name?: string
          id?: string
          message?: string
          read_at?: string | null
          replied?: boolean | null
          resolved?: boolean | null
          subject?: string
          to_user_id?: string | null
          to_user_name?: string
          to_user_type?: string
        }
        Relationships: []
      }
      permission_requests: {
        Row: {
          approval_flow: Database["public"]["Enums"]["approval_flow"] | null
          created_at: string | null
          date: string
          employee_id: string
          end_time: string | null
          evidence_url: string | null
          id: string
          jefe_approved_at: string | null
          jefe_approved_by: string | null
          reason: string | null
          rrhh_approved_at: string | null
          rrhh_approved_by: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          type: string
          updated_at: string | null
        }
        Insert: {
          approval_flow?: Database["public"]["Enums"]["approval_flow"] | null
          created_at?: string | null
          date: string
          employee_id: string
          end_time?: string | null
          evidence_url?: string | null
          id?: string
          jefe_approved_at?: string | null
          jefe_approved_by?: string | null
          reason?: string | null
          rrhh_approved_at?: string | null
          rrhh_approved_by?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          type: string
          updated_at?: string | null
        }
        Update: {
          approval_flow?: Database["public"]["Enums"]["approval_flow"] | null
          created_at?: string | null
          date?: string
          employee_id?: string
          end_time?: string | null
          evidence_url?: string | null
          id?: string
          jefe_approved_at?: string | null
          jefe_approved_by?: string | null
          reason?: string | null
          rrhh_approved_at?: string | null
          rrhh_approved_by?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permission_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          apellidos: string
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          nombres: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          apellidos: string
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nombres: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          apellidos?: string
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nombres?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sanctions: {
        Row: {
          applied_by: string | null
          created_at: string | null
          date: string
          days_of_suspension: number | null
          description: string
          employee_id: string
          evidence_url: string | null
          id: string
          infraction_level: string
          notes: string | null
          regulation_article: string | null
          status: string | null
          type: Database["public"]["Enums"]["sanction_type"]
          updated_at: string | null
        }
        Insert: {
          applied_by?: string | null
          created_at?: string | null
          date: string
          days_of_suspension?: number | null
          description: string
          employee_id: string
          evidence_url?: string | null
          id?: string
          infraction_level: string
          notes?: string | null
          regulation_article?: string | null
          status?: string | null
          type: Database["public"]["Enums"]["sanction_type"]
          updated_at?: string | null
        }
        Update: {
          applied_by?: string | null
          created_at?: string | null
          date?: string
          days_of_suspension?: number | null
          description?: string
          employee_id?: string
          evidence_url?: string | null
          id?: string
          infraction_level?: string
          notes?: string | null
          regulation_article?: string | null
          status?: string | null
          type?: Database["public"]["Enums"]["sanction_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sanctions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          area_id: string | null
          created_at: string | null
          employee_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          area_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          area_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vacation_requests: {
        Row: {
          approval_flow: Database["public"]["Enums"]["approval_flow"] | null
          created_at: string | null
          days: number
          employee_id: string
          end_date: string
          id: string
          jefe_approved_at: string | null
          jefe_approved_by: string | null
          reason: string | null
          rrhh_approved_at: string | null
          rrhh_approved_by: string | null
          start_date: string
          status: Database["public"]["Enums"]["request_status"] | null
          updated_at: string | null
        }
        Insert: {
          approval_flow?: Database["public"]["Enums"]["approval_flow"] | null
          created_at?: string | null
          days: number
          employee_id: string
          end_date: string
          id?: string
          jefe_approved_at?: string | null
          jefe_approved_by?: string | null
          reason?: string | null
          rrhh_approved_at?: string | null
          rrhh_approved_by?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string | null
        }
        Update: {
          approval_flow?: Database["public"]["Enums"]["approval_flow"] | null
          created_at?: string | null
          days?: number
          employee_id?: string
          end_date?: string
          id?: string
          jefe_approved_at?: string | null
          jefe_approved_by?: string | null
          reason?: string | null
          rrhh_approved_at?: string | null
          rrhh_approved_by?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vacation_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_area: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin_rrhh" | "jefe_area" | "empleado"
      approval_flow:
        | "pending"
        | "jefe_approved"
        | "rrhh_approved"
        | "completed"
        | "rejected"
      contract_type:
        | "indefinido"
        | "plazo_fijo"
        | "por_obra"
        | "honorarios"
        | "practica"
      employee_status: "active" | "inactive" | "on_leave" | "terminated"
      justification_type:
        | "tardanza"
        | "inasistencia"
        | "salida_temprana"
        | "permiso_medico"
        | "emergencia_familiar"
      request_status: "pending" | "approved" | "rejected" | "cancelled"
      sanction_type: "verbal" | "written" | "suspension" | "termination"
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
      app_role: ["admin_rrhh", "jefe_area", "empleado"],
      approval_flow: [
        "pending",
        "jefe_approved",
        "rrhh_approved",
        "completed",
        "rejected",
      ],
      contract_type: [
        "indefinido",
        "plazo_fijo",
        "por_obra",
        "honorarios",
        "practica",
      ],
      employee_status: ["active", "inactive", "on_leave", "terminated"],
      justification_type: [
        "tardanza",
        "inasistencia",
        "salida_temprana",
        "permiso_medico",
        "emergencia_familiar",
      ],
      request_status: ["pending", "approved", "rejected", "cancelled"],
      sanction_type: ["verbal", "written", "suspension", "termination"],
    },
  },
} as const
