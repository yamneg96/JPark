import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import ProtectedRoute from '../../components/ProtectedRoute'
import { 
  Briefcase, 
  Users, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Clock,
  DollarSign,
  MapPin,
  Star
} from 'lucide-react'
import { getJobs, getApplications } from '../../lib/supabase'
import { AuthProvider } from '../../lib/auth'
import toast from 'react-hot-toast'

export default function ClientDashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalApplications: 0
  })
  const [recentJobs, setRecentJobs] = useState([])
  const [recentApplications, setRecentApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const user = await AuthProvider.getCurrentUser()
      if (!user) return

      // Load client's jobs
      const { data: jobs, error: jobsError } = await getJobs({ client_id: user.id })
      if (jobsError) throw jobsError

      // Load applications for client's jobs
      const jobIds = jobs?.map(job => job.id) || []
      let applications = []
      
      if (jobIds.length > 0) {
        const { data: appsData, error: appsError } = await getApplications()
        if (appsError) throw appsError
        
        applications = appsData?.filter(app => jobIds.includes(app.job_id)) || []
      }

      // Calculate stats
      const totalJobs = jobs?.length || 0
      const activeJobs = jobs?.filter(job => job.status === 'open').length || 0
      const completedJobs = jobs?.filter(job => job.status === 'completed').length || 0
      const totalApplications = applications.length

      setStats({
        totalJobs,
        activeJobs,
        completedJobs,
        totalApplications
      })

      setRecentJobs(jobs?.slice(0, 5) || [])
      setRecentApplications(applications.slice(0, 5))
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['client']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
              <p className="mt-2 text-gray-600">Manage your jobs and track applications</p>
            </motion.div>
          </div>

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
                  <p className="text-sm text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
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
                <div className="bg-green-100 p-3 rounded-lg">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
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
                <div className="bg-blue-100 p-3 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Completed</p>
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
                <div className="bg-accent-100 p-3 rounded-lg">
                  <Users className="h-8 w-8 text-accent-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Applications</p>
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
                href="/post-job"
                className="flex items-center justify-center p-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Post New Job
              </Link>
              <Link
                href="/client/jobs"
                className="flex items-center justify-center p-4 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
              >
                <Briefcase className="h-5 w-5 mr-2" />
                Manage Jobs
              </Link>
              <Link
                href="/client/applications"
                className="flex items-center justify-center p-4 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
              >
                <Users className="h-5 w-5 mr-2" />
                View Applications
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Jobs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
                <Link
                  href="/client/jobs"
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No jobs posted yet</p>
                    <Link
                      href="/post-job"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Post your first job
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Applications */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                <Link
                  href="/client/applications"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recentApplications.length > 0 ? (
                  recentApplications.map((application) => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{application.jobs?.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Applied by {application.profiles?.full_name}
                          </p>
                          <div className="flex items-center mt-2 space-x-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <Star className="h-4 w-4 mr-1" />
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
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No applications yet</p>
                    <p className="text-sm">Applications will appear here when workers apply to your jobs</p>
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