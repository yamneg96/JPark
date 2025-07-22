import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AuthProvider } from '../lib/auth'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log('Checking authentication...')
      const currentUser = await AuthProvider.getCurrentUser()
      
      if (!currentUser) {
        console.log('No user found, redirecting to login')
        router.push('/login')
        return
      }

      console.log('User found:', currentUser.id)
      setUser(currentUser)
      
      // Add a small delay to ensure database is ready
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const { data: profileData } = await AuthProvider.getProfile(currentUser.id)
      
      if (!profileData) {
        console.log('No profile found for user:', currentUser.id)
        // Instead of redirecting to login, show an error message
        alert('Profile not found. Please contact support or try registering again.')
        return
      }

      console.log('Profile found:', profileData)
      setProfile(profileData)

      // Check role permissions
      if (allowedRoles.length > 0 && !allowedRoles.includes(profileData.role)) {
        console.log('User role not allowed:', profileData.role, 'Required:', allowedRoles)
        router.push('/unauthorized')
        return
      }

      console.log('Authentication successful')
      setLoading(false)
    } catch (error) {
      console.error('Auth check error:', error)
      alert('Authentication error: ' + error.message)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return children
}