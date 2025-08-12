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
          settings: Json | null
          is_active: boolean
          is_published: boolean
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
          settings?: Json | null
          is_active?: boolean
          is_published?: boolean
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
          settings?: Json | null
          is_active?: boolean
          is_published?: boolean
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
          custom_fields: Json | null
          is_active: boolean
          is_published: boolean
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
          settings?: Json | null
          custom_fields?: Json | null
          is_active?: boolean
          is_published?: boolean
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
          custom_fields?: Json | null
          settings?: Json | null
          is_active?: boolean
          is_published?: boolean
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
          custom_fields: Json | null
          payment_id: string | null
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
          custom_fields?: Json | null
          payment_id?: string | null
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
          custom_fields?: Json | null
          payment_id?: string | null
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
      invoices: {
        Row: {
          id: string
          store_id: string
          user_id: string | null
          amount: number
          status: string
          due_date: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          user_id?: string | null
          amount: number
          status?: string
          due_date?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          user_id?: string | null
          amount?: number
          status?: string
          due_date?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      payout_methods: {
        Row: {
          id: string
          user_id: string
          type: string
          details: Json
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          details: Json
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          details?: Json
          is_default?: boolean
          created_at?: string
        }
      }
      payout_requests: {
        Row: {
          id: string
          store_id: string
          amount: number
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          amount: number
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          amount?: number
          status?: string
          notes?: string | null
          created_at?: string
        }
      }
      platform_settings: {
        Row: {
          key: string
          value: Json
          is_public: boolean
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          is_public?: boolean
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          is_public?: boolean
          updated_at?: string
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          price: number
          interval: string
          features: Json | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          interval?: string
          features?: Json | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          interval?: string
          features?: Json | null
          is_active?: boolean
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string | null
          status: string
          current_period_end: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id?: string | null
          status?: string
          current_period_end?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string | null
          status?: string
          current_period_end?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          store_id: string
          amount: number
          type: string
          status: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          amount: number
          type: string
          status?: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          amount?: number
          type?: string
          status?: string
          metadata?: Json | null
          created_at?: string
        }
      }
      usage_tracking: {
        Row: {
          id: string
          user_id: string
          event: string
          properties: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event: string
          properties?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event?: string
          properties?: Json | null
          created_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          store_id: string
          balance: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          balance?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          balance?: number
          currency?: string
          created_at?: string
          updated_at?: string
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