import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqqwpchhhvdlepipvivp.supabase.co'
const supabaseKey = 'sb_publishable_MuLUhh8DLw2xZ0RPUWs3mQ_u9OGdqsu'

export const supabase = createClient(supabaseUrl, supabaseKey)
