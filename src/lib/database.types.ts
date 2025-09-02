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
      products: {
        Row: {
          id: string
          name: string
          category: 'lunettes' | 'bagues' | 'colliers' | 'sets' | 'bracelets'
          reference: string
          purchase_price: number
          selling_price: number
          quantity: number
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: 'lunettes' | 'bagues' | 'colliers' | 'sets' | 'bracelets'
          reference?: string
          purchase_price: number
          selling_price: number
          quantity: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: 'lunettes' | 'bagues' | 'colliers' | 'sets' | 'bracelets'
          reference?: string
          purchase_price?: number
          selling_price?: number
          quantity?: number
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          product_id: string
          quantity_sold: number
          sale_price: number
          sale_date: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity_sold?: number
          sale_price: number
          sale_date?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          quantity_sold?: number
          sale_price?: number
          sale_date?: string
          user_id?: string
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          description: string
          amount: number
          expense_date: string
          type: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          description: string
          amount: number
          expense_date?: string
          type?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          description?: string
          amount?: number
          expense_date?: string
          type?: string
          user_id?: string
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          role: 'owner' | 'manager'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'owner' | 'manager'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'owner' | 'manager'
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

export type Product = Database['public']['Tables']['products']['Row'];
export type Sale = Database['public']['Tables']['sales']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];