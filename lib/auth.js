import { supabase } from './supabase'

export const AuthProvider = {
  // Register user
  async register(userData) {
    try {
      console.log('Starting registration process...')
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
      console.log('Auth signup successful:', data)

      // Create profile record
      if (data.user) {
        console.log('Creating profile for user:', data.user.id)
        
        const profileData = {
          id: data.user.id,
          full_name: userData.full_name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          status: 'active',
          created_at: new Date().toISOString()
        }

        console.log('Profile data to insert:', profileData)
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData])

        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw profileError
        }
        console.log('Profile created successfully')
      }

      return { data, error: null }
    } catch (error) {
      console.error('Registration error:', error)
      return { data: null, error }
    }
  },

  // Login user
  async login(email, password) {
    try {
      console.log('Starting login process for:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      console.log('Login successful:', data)

      return { data, error: null }
    } catch (error) {
      console.error('Login error:', error)
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
      console.error('Logout error:', error)
      return { error }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('Current user:', user)
      return user
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  },

  // Get user profile
  async getProfile(userId) {
    try {
      console.log('Getting profile for user:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Get profile error:', error)
        throw error
      }
      console.log('Profile found:', data)
      return { data, error: null }
    } catch (error) {
      console.error('Get profile error:', error)
      return { data: null, error }
    }
  }
}