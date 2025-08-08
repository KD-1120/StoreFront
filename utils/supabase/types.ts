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
          user_id: string
          full_name: string | null
          email: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      stores: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          theme_color: string | null
          domain: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          theme_color?: string | null
          domain?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          theme_color?: string | null
          domain?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          store_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          category: string | null
          inventory_count: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          category?: string | null
          inventory_count?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category?: string | null
          inventory_count?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          store_id: string
          email: string
          name: string | null
          phone: string | null
          address: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          email: string
          name?: string | null
          phone?: string | null
          address?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          email?: string
          name?: string | null
          phone?: string | null
          address?: Json | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          store_id: string
          customer_id: string | null
          customer_email: string | null
          customer_name: string | null
          total_amount: number
          status: string
          shipping_address: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          customer_id?: string | null
          customer_email?: string | null
          customer_name?: string | null
          total_amount: number
          status?: string
          shipping_address?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          customer_id?: string | null
          customer_email?: string | null
          customer_name?: string | null
          total_amount?: number
          status?: string
          shipping_address?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          created_at?: string
        }
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