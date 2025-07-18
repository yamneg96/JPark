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
      const currentUser = await AuthProvider.getCurrentUser()
      
      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)
      const { data: profileData } = await AuthProvider.getProfile(currentUser.id)
      
      if (!profileData) {
        router.push('/login')
        return
      }

      setProfile(profileData)

      // Check role permissions
      if (allowedRoles.length > 0 && !allowedRoles.includes(profileData.role)) {
        router.push('/unauthorized')
        return
      }

      setLoading(false)
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/login')
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