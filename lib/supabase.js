import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
        

// Auth helpers
export const signUp = async (email, password, userData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Profile helpers
export const createProfile = async (userId, profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ id: userId, ...profileData }])
    .select()
  return { data, error }
}

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
  return { data, error }
}

// Job helpers
export const createJob = async (jobData) => {
  const { data, error } = await supabase
    .from('jobs')
    .insert([jobData])
    .select()
  return { data, error }
}

export const getJobs = async (filters = {}) => {
  let query = supabase
    .from('jobs')
    .select(`
      *,
      profiles(full_name, avatar_url)
    `)
    .order('created_at', { ascending: false })

  if (filters.client_id) {
    query = query.eq('client_id', filters.client_id)
  }

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query
  return { data, error }
}

export const updateJob = async (jobId, updates) => {
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
  return { data, error }
}

// Application helpers
export const createApplication = async (applicationData) => {
  const { data, error } = await supabase
    .from('applications')
    .insert([applicationData])
    .select()
  return { data, error }
}

export const getApplications = async (filters = {}) => {
  let query = supabase
    .from('applications')
    .select(`
      *,
      jobs(*),
      profiles(full_name, avatar_url)
    `)
    .order('created_at', { ascending: false })

  if (filters.worker_id) {
    query = query.eq('worker_id', filters.worker_id)
  }

  if (filters.job_id) {
    query = query.eq('job_id', filters.job_id)
  }

  const { data, error } = await query
  return { data, error }
}

export const updateApplication = async (applicationId, updates) => {
  const { data, error } = await supabase
    .from('applications')
    .update(updates)
    .eq('id', applicationId)
    .select()
  return { data, error }
}