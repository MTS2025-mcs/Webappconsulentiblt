import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Client {
  id: string
  user_id: string
  nome_azienda: string
  nome_titolare: string
  ragione_sociale: string
  data_acquisizione: string
  created_at: string
}

export interface VSSTransaction {
  id: string
  user_id: string
  client_id: string
  importo: number
  note?: string
  data: string
  created_at: string
}

export interface GITransaction {
  id: string
  user_id: string
  client_id: string
  importo: number
  note?: string
  data: string
  created_at: string
}

export interface VSDTransaction {
  id: string
  user_id: string
  client_id: string
  importo_totale: number
  importo_personale: number
  note?: string
  data: string
  created_at: string
}

export interface UserProfile {
  id: string
  full_name: string
  created_at: string
}
