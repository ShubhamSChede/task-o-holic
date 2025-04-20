// src/types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          password: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          password: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          password?: string
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      todos: {
        Row: {
          id: string
          title: string
          description: string | null
          is_complete: boolean
          due_date: string | null
          priority: string | null
          tags: string[] | null
          created_by: string
          organization_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          is_complete?: boolean
          due_date?: string | null
          priority?: string | null
          tags?: string[] | null
          created_by: string
          organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          is_complete?: boolean
          due_date?: string | null
          priority?: string | null
          tags?: string[] | null
          created_by?: string
          organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "todos_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "todos_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      frequent_tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          priority: string | null
          tags: string[] | null
          organization_id: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          priority?: string | null
          tags?: string[] | null
          organization_id: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          priority?: string | null
          tags?: string[] | null
          organization_id?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "frequent_tasks_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "frequent_tasks_organization_id_fkey"
            columns: ["organization_id"]
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
        get_todo_stats: {
          Args: { user_id: string };
          Returns: {
            total: number;
            completed: number;
            pending: number;
          };
        };
      }
    Enums: {
      [_ in never]: never
    }
  }
}