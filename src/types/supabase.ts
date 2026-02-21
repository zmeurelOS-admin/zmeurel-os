// Auto-generated Supabase types helper
// This file provides type utilities for Supabase tables

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
      clienti: {
        Row: {
          id: string
          tenant_id: string
          nume: string
          telefon: string | null
          email: string | null
          adresa: string | null
          pret_negociat_lei_kg: number | null
          observatii: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string
          nume: string
          telefon?: string | null
          email?: string | null
          adresa?: string | null
          pret_negociat_lei_kg?: number | null
          observatii?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          nume?: string
          telefon?: string | null
          email?: string | null
          adresa?: string | null
          pret_negociat_lei_kg?: number | null
          observatii?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      parcele: {
        Row: {
          id: string
          tenant_id: string
          id_parcela: string
          nume_parcela: string
          suprafata_m2: number
          soi_plantat: string | null
          an_plantare: number
          nr_plante: number | null
          status: string
          gps_lat: number | null
          gps_lng: number | null
          observatii: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string
          id_parcela?: string
          nume_parcela: string
          suprafata_m2: number
          soi_plantat?: string | null
          an_plantare: number
          nr_plante?: number | null
          status?: string
          gps_lat?: number | null
          gps_lng?: number | null
          observatii?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          id_parcela?: string
          nume_parcela?: string
          suprafata_m2?: number
          soi_plantat?: string | null
          an_plantare?: number
          nr_plante?: number | null
          status?: string
          gps_lat?: number | null
          gps_lng?: number | null
          observatii?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      [key: string]: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
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
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
