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
      activitati_agricole: {
        Row: {
          created_at: string | null
          data_aplicare: string
          doza: string | null
          id: string
          id_activitate: string
          observatii: string | null
          operator: string | null
          parcela_id: string | null
          produs_utilizat: string | null
          tenant_id: string | null
          timp_pauza_zile: number | null
          tip_activitate: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_aplicare: string
          doza?: string | null
          id?: string
          id_activitate: string
          observatii?: string | null
          operator?: string | null
          parcela_id?: string | null
          produs_utilizat?: string | null
          tenant_id?: string | null
          timp_pauza_zile?: number | null
          tip_activitate?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_aplicare?: string
          doza?: string | null
          id?: string
          id_activitate?: string
          observatii?: string | null
          operator?: string | null
          parcela_id?: string | null
          produs_utilizat?: string | null
          tenant_id?: string | null
          timp_pauza_zile?: number | null
          tip_activitate?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activitati_agricole_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcele"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activitati_agricole_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcele_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activitati_agricole_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      activitati_extra_season: {
        Row: {
          cost_lei: number | null
          created_at: string | null
          data: string
          descriere: string | null
          id: string
          id_activitate: string
          manopera_ore: number | null
          manopera_persoane: number | null
          observatii: string | null
          parcela_id: string | null
          tenant_id: string
          tip_activitate: string
          updated_at: string | null
        }
        Insert: {
          cost_lei?: number | null
          created_at?: string | null
          data: string
          descriere?: string | null
          id?: string
          id_activitate: string
          manopera_ore?: number | null
          manopera_persoane?: number | null
          observatii?: string | null
          parcela_id?: string | null
          tenant_id: string
          tip_activitate: string
          updated_at?: string | null
        }
        Update: {
          cost_lei?: number | null
          created_at?: string | null
          data?: string
          descriere?: string | null
          id?: string
          id_activitate?: string
          manopera_ore?: number | null
          manopera_persoane?: number | null
          observatii?: string | null
          parcela_id?: string | null
          tenant_id?: string
          tip_activitate?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activitati_extra_season_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcele"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activitati_extra_season_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcele_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activitati_extra_season_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cheltuieli_diverse: {
        Row: {
          categorie: string | null
          created_at: string | null
          data: string
          descriere: string | null
          document_url: string | null
          furnizor: string | null
          id: string
          id_cheltuiala: string
          suma_lei: number
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          categorie?: string | null
          created_at?: string | null
          data: string
          descriere?: string | null
          document_url?: string | null
          furnizor?: string | null
          id?: string
          id_cheltuiala: string
          suma_lei: number
          tenant_id?: string
          updated_at?: string | null
        }
        Update: {
          categorie?: string | null
          created_at?: string | null
          data?: string
          descriere?: string | null
          document_url?: string | null
          furnizor?: string | null
          id?: string
          id_cheltuiala?: string
          suma_lei?: number
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cheltuieli_diverse_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clienti: {
        Row: {
          adresa: string | null
          created_at: string | null
          email: string | null
          id: string
          id_client: string
          nume_client: string
          observatii: string | null
          pret_negociat_lei_kg: number | null
          telefon: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          adresa?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          id_client: string
          nume_client: string
          observatii?: string | null
          pret_negociat_lei_kg?: number | null
          telefon?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Update: {
          adresa?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          id_client?: string
          nume_client?: string
          observatii?: string | null
          pret_negociat_lei_kg?: number | null
          telefon?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clienti_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      culegatori: {
        Row: {
          created_at: string | null
          data_angajare: string | null
          id: string
          id_culegator: string
          nume_prenume: string
          observatii: string | null
          status_activ: boolean | null
          tarif_lei_kg: number | null
          telefon: string | null
          tenant_id: string | null
          tip_angajare: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_angajare?: string | null
          id?: string
          id_culegator: string
          nume_prenume: string
          observatii?: string | null
          status_activ?: boolean | null
          tarif_lei_kg?: number | null
          telefon?: string | null
          tenant_id?: string | null
          tip_angajare?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_angajare?: string | null
          id?: string
          id_culegator?: string
          nume_prenume?: string
          observatii?: string | null
          status_activ?: boolean | null
          tarif_lei_kg?: number | null
          telefon?: string | null
          tenant_id?: string | null
          tip_angajare?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "culegatori_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      investitii: {
        Row: {
          categorie: string | null
          created_at: string | null
          data: string
          descriere: string | null
          document_url: string | null
          furnizor: string | null
          id: string
          id_investitie: string
          parcela_id: string | null
          suma_lei: number
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          categorie?: string | null
          created_at?: string | null
          data: string
          descriere?: string | null
          document_url?: string | null
          furnizor?: string | null
          id?: string
          id_investitie: string
          parcela_id?: string | null
          suma_lei: number
          tenant_id?: string
          updated_at?: string | null
        }
        Update: {
          categorie?: string | null
          created_at?: string | null
          data?: string
          descriere?: string | null
          document_url?: string | null
          furnizor?: string | null
          id?: string
          id_investitie?: string
          parcela_id?: string | null
          suma_lei?: number
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investitii_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcele"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investitii_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcele_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investitii_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      nomenclatoare: {
        Row: {
          activ: boolean | null
          created_at: string | null
          descriere: string | null
          id: string
          nivel: string | null
          tenant_id: string | null
          tip: string
          updated_at: string | null
          valoare: string
        }
        Insert: {
          activ?: boolean | null
          created_at?: string | null
          descriere?: string | null
          id?: string
          nivel?: string | null
          tenant_id?: string | null
          tip: string
          updated_at?: string | null
          valoare: string
        }
        Update: {
          activ?: boolean | null
          created_at?: string | null
          descriere?: string | null
          id?: string
          nivel?: string | null
          tenant_id?: string | null
          tip?: string
          updated_at?: string | null
          valoare?: string
        }
        Relationships: [
          {
            foreignKeyName: "nomenclatoare_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      parcele: {
        Row: {
          an_plantare: number
          created_at: string | null
          gps_lat: number | null
          gps_lng: number | null
          id: string
          id_parcela: string
          nr_plante: number | null
          nume_parcela: string
          observatii: string | null
          soi_plantat: string | null
          status: string | null
          suprafata_m2: number
          tenant_id: string
          tip_fruct: string | null
          updated_at: string | null
        }
        Insert: {
          an_plantare: number
          created_at?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          id_parcela: string
          nr_plante?: number | null
          nume_parcela: string
          observatii?: string | null
          soi_plantat?: string | null
          status?: string | null
          suprafata_m2: number
          tenant_id?: string
          tip_fruct?: string | null
          updated_at?: string | null
        }
        Update: {
          an_plantare?: number
          created_at?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          id_parcela?: string
          nr_plante?: number | null
          nume_parcela?: string
          observatii?: string | null
          soi_plantat?: string | null
          status?: string | null
          suprafata_m2?: number
          tenant_id?: string
          tip_fruct?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parcele_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      recoltari: {
        Row: {
          cantitate_kg: number
          created_at: string | null
          culegator_id: string | null
          data: string
          id: string
          id_recoltare: string
          observatii: string | null
          parcela_id: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          cantitate_kg: number
          created_at?: string | null
          culegator_id?: string | null
          data: string
          id?: string
          id_recoltare: string
          observatii?: string | null
          parcela_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Update: {
          cantitate_kg?: number
          created_at?: string | null
          culegator_id?: string | null
          data?: string
          id?: string
          id_recoltare?: string
          observatii?: string | null
          parcela_id?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recoltari_culegator_id_fkey"
            columns: ["culegator_id"]
            isOneToOne: false
            referencedRelation: "culegatori"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recoltari_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcele"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recoltari_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcele_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recoltari_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          id: string
          nume_ferma: string
          owner_user_id: string | null
          plan: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nume_ferma: string
          owner_user_id?: string | null
          plan?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nume_ferma?: string
          owner_user_id?: string | null
          plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vanzari: {
        Row: {
          cantitate_kg: number
          client_id: string | null
          created_at: string | null
          data: string
          id: string
          id_vanzare: string
          observatii_ladite: string | null
          pret_lei_kg: number
          status_plata: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          cantitate_kg: number
          client_id?: string | null
          created_at?: string | null
          data: string
          id?: string
          id_vanzare: string
          observatii_ladite?: string | null
          pret_lei_kg: number
          status_plata?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Update: {
          cantitate_kg?: number
          client_id?: string | null
          created_at?: string | null
          data?: string
          id?: string
          id_vanzare?: string
          observatii_ladite?: string | null
          pret_lei_kg?: number
          status_plata?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vanzari_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clienti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vanzari_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vanzari_butasi: {
        Row: {
          cantitate_butasi: number
          client_id: string | null
          created_at: string | null
          data: string
          id: string
          id_vanzare_butasi: string
          observatii: string | null
          parcela_sursa_id: string | null
          pret_unitar_lei: number
          soi_butasi: string | null
          tenant_id: string | null
          tip_fruct: string | null
          updated_at: string | null
        }
        Insert: {
          cantitate_butasi: number
          client_id?: string | null
          created_at?: string | null
          data: string
          id?: string
          id_vanzare_butasi: string
          observatii?: string | null
          parcela_sursa_id?: string | null
          pret_unitar_lei: number
          soi_butasi?: string | null
          tenant_id?: string | null
          tip_fruct?: string | null
          updated_at?: string | null
        }
        Update: {
          cantitate_butasi?: number
          client_id?: string | null
          created_at?: string | null
          data?: string
          id?: string
          id_vanzare_butasi?: string
          observatii?: string | null
          parcela_sursa_id?: string | null
          pret_unitar_lei?: number
          soi_butasi?: string | null
          tenant_id?: string | null
          tip_fruct?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vanzari_butasi_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clienti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vanzari_butasi_parcela_sursa_id_fkey"
            columns: ["parcela_sursa_id"]
            isOneToOne: false
            referencedRelation: "parcele"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vanzari_butasi_parcela_sursa_id_fkey"
            columns: ["parcela_sursa_id"]
            isOneToOne: false
            referencedRelation: "parcele_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vanzari_butasi_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      activitati_extended: {
        Row: {
          created_at: string | null
          data_aplicare: string | null
          data_recoltare_permisa: string | null
          doza: string | null
          id: string | null
          id_activitate: string | null
          observatii: string | null
          operator: string | null
          parcela_id: string | null
          produs_utilizat: string | null
          status_pauza: string | null
          tenant_id: string | null
          timp_pauza_zile: number | null
          tip_activitate: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_aplicare?: string | null
          data_recoltare_permisa?: never
          doza?: string | null
          id?: string | null
          id_activitate?: string | null
          observatii?: string | null
          operator?: string | null
          parcela_id?: string | null
          produs_utilizat?: string | null
          status_pauza?: never
          tenant_id?: string | null
          timp_pauza_zile?: number | null
          tip_activitate?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_aplicare?: string | null
          data_recoltare_permisa?: never
          doza?: string | null
          id?: string | null
          id_activitate?: string | null
          observatii?: string | null
          operator?: string | null
          parcela_id?: string | null
          produs_utilizat?: string | null
          status_pauza?: never
          tenant_id?: string | null
          timp_pauza_zile?: number | null
          tip_activitate?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activitati_agricole_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcele"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activitati_agricole_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcele_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activitati_agricole_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      activitati_extra_extended: {
        Row: {
          cost_lei: number | null
          cost_lei_per_m2: number | null
          cost_lei_per_ora: number | null
          created_at: string | null
          data: string | null
          descriere: string | null
          id: string | null
          id_activitate: string | null
          manopera_ore: number | null
          manopera_persoane: number | null
          nume_parcela: string | null
          observatii: string | null
          parcela_id: string | null
          soi_plantat: string | null
          suprafata_m2: number | null
          tenant_id: string | null
          tip_activitate: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activitati_extra_season_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcele"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activitati_extra_season_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcele_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activitati_extra_season_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      parcele_extended: {
        Row: {
          an_plantare: number | null
          created_at: string | null
          densitate_plante_m2: number | null
          gps_lat: number | null
          gps_lng: number | null
          id: string | null
          id_parcela: string | null
          nr_plante: number | null
          nume_parcela: string | null
          observatii: string | null
          soi_plantat: string | null
          status: string | null
          suprafata_m2: number | null
          tenant_id: string | null
          tip_fruct: string | null
          updated_at: string | null
          varsta_ani: number | null
        }
        Insert: {
          an_plantare?: number | null
          created_at?: string | null
          densitate_plante_m2?: never
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string | null
          id_parcela?: string | null
          nr_plante?: number | null
          nume_parcela?: string | null
          observatii?: string | null
          soi_plantat?: string | null
          status?: string | null
          suprafata_m2?: number | null
          tenant_id?: string | null
          tip_fruct?: string | null
          updated_at?: string | null
          varsta_ani?: never
        }
        Update: {
          an_plantare?: number | null
          created_at?: string | null
          densitate_plante_m2?: never
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string | null
          id_parcela?: string | null
          nr_plante?: number | null
          nume_parcela?: string | null
          observatii?: string | null
          soi_plantat?: string | null
          status?: string | null
          suprafata_m2?: number | null
          tenant_id?: string | null
          tip_fruct?: string | null
          updated_at?: string | null
          varsta_ani?: never
        }
        Relationships: [
          {
            foreignKeyName: "parcele_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      recoltari_extended: {
        Row: {
          cantitate_neta_kg: number | null
          created_at: string | null
          culegator_id: string | null
          data: string | null
          id: string | null
          id_recoltare: string | null
          observatii: string | null
          parcela_id: string | null
          tarif_lei_kg: number | null
          tenant_id: string | null
          updated_at: string | null
          valoare_munca_lei: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recoltari_culegator_id_fkey"
            columns: ["culegator_id"]
            isOneToOne: false
            referencedRelation: "culegatori"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recoltari_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcele"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recoltari_parcela_id_fkey"
            columns: ["parcela_id"]
            isOneToOne: false
            referencedRelation: "parcele_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recoltari_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vanzari_butasi_extended: {
        Row: {
          cantitate_butasi: number | null
          client_id: string | null
          created_at: string | null
          data: string | null
          id: string | null
          id_vanzare_butasi: string | null
          observatii: string | null
          parcela_sursa_id: string | null
          pret_unitar_lei: number | null
          soi_butasi: string | null
          tenant_id: string | null
          tip_fruct: string | null
          updated_at: string | null
          valoare_totala_lei: number | null
        }
        Insert: {
          cantitate_butasi?: number | null
          client_id?: string | null
          created_at?: string | null
          data?: string | null
          id?: string | null
          id_vanzare_butasi?: string | null
          observatii?: string | null
          parcela_sursa_id?: string | null
          pret_unitar_lei?: number | null
          soi_butasi?: string | null
          tenant_id?: string | null
          tip_fruct?: string | null
          updated_at?: string | null
          valoare_totala_lei?: never
        }
        Update: {
          cantitate_butasi?: number | null
          client_id?: string | null
          created_at?: string | null
          data?: string | null
          id?: string | null
          id_vanzare_butasi?: string | null
          observatii?: string | null
          parcela_sursa_id?: string | null
          pret_unitar_lei?: number | null
          soi_butasi?: string | null
          tenant_id?: string | null
          tip_fruct?: string | null
          updated_at?: string | null
          valoare_totala_lei?: never
        }
        Relationships: [
          {
            foreignKeyName: "vanzari_butasi_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clienti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vanzari_butasi_parcela_sursa_id_fkey"
            columns: ["parcela_sursa_id"]
            isOneToOne: false
            referencedRelation: "parcele"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vanzari_butasi_parcela_sursa_id_fkey"
            columns: ["parcela_sursa_id"]
            isOneToOne: false
            referencedRelation: "parcele_extended"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vanzari_butasi_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vanzari_extended: {
        Row: {
          cantitate_kg: number | null
          client_id: string | null
          created_at: string | null
          data: string | null
          id: string | null
          id_vanzare: string | null
          observatii_ladite: string | null
          pret_lei_kg: number | null
          status_plata: string | null
          tenant_id: string | null
          updated_at: string | null
          valoare_totala_lei: number | null
        }
        Insert: {
          cantitate_kg?: number | null
          client_id?: string | null
          created_at?: string | null
          data?: string | null
          id?: string | null
          id_vanzare?: string | null
          observatii_ladite?: string | null
          pret_lei_kg?: number | null
          status_plata?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          valoare_totala_lei?: never
        }
        Update: {
          cantitate_kg?: number | null
          client_id?: string | null
          created_at?: string | null
          data?: string | null
          id?: string | null
          id_vanzare?: string | null
          observatii_ladite?: string | null
          pret_lei_kg?: number | null
          status_plata?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          valoare_totala_lei?: never
        }
        Relationships: [
          {
            foreignKeyName: "vanzari_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clienti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vanzari_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
  public: {
    Enums: {},
  },
} as const
