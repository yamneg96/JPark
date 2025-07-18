import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import ProtectedRoute from '../../components/ProtectedRoute'
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Search, 
  Star, 
  Calendar, 
  DollarSign,
  MapPin,
  User
} from 'lucide-react'
import { getJobs, getApplications, getProfile } from '../../lib/supabase'
import { AuthProvider } from '../../lib/auth'
import toast from 'react-hot-toast'

export default function WorkerDashboard() {
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeApplications: 0,
    completedJobs: 0,
    availableJobs: 0
  })
  const [recentJobs, setRecentJobs] = useState([])
  const [myApplications, setMyApplications] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const user = await AuthProvider.getCurrentUser()
      if (!user) return

      // Load user profile
      const { data: profileData, error: profileError } = await getProfile(user.id)
      if (profileError) throw profileError
      setProfile(profileData)

      // Load worker's applications
      const { data: applications, error: appsError } = await getApplications({ worker_id: user.id })
      if (appsError) throw appsError

      // Load available jobs
      const { data: jobs, error: jobsError } = await getJobs({ status: 'open' })
      if (jobsError) throw jobsError

      // Calculate stats
      const totalApplications = applications?.length || 0
      const activeApplications = applications?.filter(app => app.status === 'pending').length || 0
      const completedJobs = applications?.filter(app => app.status === 'completed').length || 0
      const availableJobs = jobs?.length || 0

      setStats({
        totalApplications,
        activeApplications,
        completedJobs,
        availableJobs
      })

      setRecentJobs(jobs?.slice(0, 5) || [])
      setMyApplications(applications?.slice(0, 5) || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getCompletionPercentage = () => {
    if (!profile) return 0
    
    const requiredFields = ['full_name', 'email', 'phone', 'experience_level', 'skills', 'bio']
    const completedFields = requiredFields.filter(field => profile[field] && profile[field].length > 0)
    
    return Math.round((completedFields.length / requiredFields.length) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['worker']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold text-gray-900">Worker Dashboard</h1>
              <p className="mt-2 text-gray-600">Find opportunities and manage your applications</p>
            </motion.div>
          </div>

          {/* Profile Completion Alert */}
          {profile && getCompletionPercentage() < 100 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8"
            >
              <div className="flex items-center">
                <User className="h-5 w-5 text-yellow-600 mr-3" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Complete your profile to get more job opportunities
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your profile is {getCompletionPercentage()}% complete
                  </p>
                </div>
                <Link
                  href="/worker/profile"
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
                >
                  Complete Profile
                </Link>
              </div>
            </motion.div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="flex items-center">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Briefcase className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Available Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.availableJobs}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Pending Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeApplications}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Completed Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedJobs}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-lg mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/jobs"
                className="flex items-center justify-center p-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Search className="h-5 w-5 mr-2" />
                Browse Jobs
              </Link>
              <Link
                href="/worker/applications"
                className="flex items-center justify-center p-4 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
              >
                <Clock className="h-5 w-5 mr-2" />
                My Applications
              </Link>
              <Link
                href="/worker/profile"
                className="flex items-center justify-center p-4 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
              >
                <User className="h-5 w-5 mr-2" />
                Update Profile
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Job Opportunities */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Job Opportunities</h2>
                <Link
                  href="/jobs"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentJobs.length > 0 ? (
                  recentJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                          <div className="flex items-center mt-2 space-x-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {formatCurrency(job.budget)}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.location}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(job.created_at)}
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/jobs/${job.id}`}
                          className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No jobs available at the moment</p>
                    <p className="text-sm">Check back later for new opportunities</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* My Applications */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">My Applications</h2>
                <Link
                  href="/worker/applications"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {myApplications.length > 0 ? (
                  myApplications.map((application) => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{application.jobs?.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{application.cover_letter}</p>
                          <div className="flex items-center mt-2 space-x-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {application.proposed_rate ? formatCurrency(application.proposed_rate) : 'Rate not specified'}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(application.created_at)}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No applications yet</p>
                    <Link
                      href="/jobs"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Browse jobs to get started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}