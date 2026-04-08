import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tvzenknzcxuegkzujihu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2emVua256Y3h1ZWdrenVqaWh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NTYyNDIsImV4cCI6MjA4ODEzMjI0Mn0.rbceObIw6hMdWyCtBEu487cPAo3jxgtyw_3X44vsySE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Get user_id from localStorage for scoping queries.
 * All frontend queries should use this to filter by user.
 */
export function getCurrentUserId() {
    return localStorage.getItem('chrona_user_id')
}

/**
 * Helper: fetch events scoped to the current user
 */
export async function fetchUserEvents(orderBy = 'event_datetime') {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order(orderBy, { ascending: true })

    if (error) throw error
    return data || []
}

/**
 * Helper: fetch drafts scoped to the current user
 */
export async function fetchUserDrafts() {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .eq('user_id', userId)
        .order('archived_at', { ascending: false })

    if (error) throw error
    return data || []
}
