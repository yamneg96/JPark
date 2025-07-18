import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase,
  Calendar,
  Star,
  Users
} from 'lucide-react'
import { getJobs } from '../../lib/supabase'
import { AuthProvider } from '../../lib/auth'
import toast from 'react-hot-toast'

const categories = [
  'All Categories',
  'Web Development',
  'Mobile Development',
  'Design & Creative',
  'Writing & Translation',
  'Digital Marketing',
  'Data Science',
  'Engineering',
  'Sales & Business Development',
  'Customer Service',
  'Admin & Virtual Assistant',
  'Photography',
  'Video & Animation',
  'Other'
]

const experienceLevels = [
  'All Levels',
  'Entry Level',
  'Intermediate',
  'Expert'
]

const projectTypes = [
  'All Types',
  'Fixed Price',
  'Hourly',
  'Ongoing'
]

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedExperience, setSelectedExperience] = useState('All Levels')
  const [selectedType, setSelectedType] = useState('All Types')
  const [sortBy, setSortBy] = useState('newest')
  const [user, setUser] = useState(null)

  useEffect(() => {
    loadJobs()
    checkUser()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [jobs, searchTerm, selectedCategory, selectedExperience, selectedType, sortBy])

  const checkUser = async () => {
    const currentUser = await AuthProvider.getCurrentUser()
    setUser(currentUser)
  }

  const loadJobs = async () => {
    try {
      const { data, error } = await getJobs({ status: 'open' })
      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error('Error loading jobs:', error)
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const filterJobs = () => {
    let filtered = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = selectedCategory === 'All Categories' || job.category === selectedCategory
      const matchesExperience = selectedExperience === 'All Levels' || job.experience_level === selectedExperience.toLowerCase().replace(' ', '_')
      const matchesType = selectedType === 'All Types' || job.project_type === selectedType.toLowerCase().replace(' ', '_')

      return matchesSearch && matchesCategory && matchesExperience && matchesType
    })

    // Sort jobs
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
      case 'highest_budget':
        filtered.sort((a, b) => b.budget - a.budget)
        break
      case 'lowest_budget':
        filtered.sort((a, b) => a.budget - b.budget)
        break
      default:
        break
    }

    setFilteredJobs(filtered)
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

  const getExperienceColor = (level) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'expert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProjectTypeColor = (type) => {
    switch (type) {
      case 'fixed': return 'bg-blue-100 text-blue-800'
      case 'hourly': return 'bg-purple-100 text-purple-800'
      case 'ongoing': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
            <p className="mt-2 text-gray-600">Find your next opportunity from {jobs.length} available jobs</p>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-lg mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Filter */}
            <div>
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest_budget">Highest Budget</option>
                <option value="lowest_budget">Lowest Budget</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperienceColor(job.experience_level)}`}>
                          {job.experience_level?.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProjectTypeColor(job.project_type)}`}>
                          {job.project_type?.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills?.slice(0, 5).map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills?.length > 5 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                            +{job.skills.length - 5} more
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          <span className="font-medium">{formatCurrency(job.budget)}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{job.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(job.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-sm text-gray-500">{job.category}</span>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-12"
            >
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your search criteria to find more opportunities.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}