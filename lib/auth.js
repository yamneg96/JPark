import { supabase } from './supabase'

export const AuthProvider = {
  // Register user
  async register(userData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            phone: userData.phone,
            role: userData.role
          }
        }
      })

      if (error) throw error

      // Create profile record
      if (data.user) {
        const profileData = {
          id: data.user.id,
          full_name: userData.full_name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          created_at: new Date().toISOString()
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData])

        if (profileError) throw profileError
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Login user
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  // Logout user
  async logout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      return null
    }
  },

  // Get user profile
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }
}