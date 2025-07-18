import { useState } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import ProtectedRoute from '../components/ProtectedRoute'
import { createJob } from '../lib/supabase'
import { AuthProvider } from '../lib/auth'
import { 
  Briefcase, 
  DollarSign, 
  MapPin, 
  Calendar, 
  FileText, 
  Tag,
  Clock,
  Users
} from 'lucide-react'

const categories = [
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

const skillLevels = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' }
]

const projectTypes = [
  { value: 'fixed', label: 'Fixed Price Project' },
  { value: 'hourly', label: 'Hourly Project' },
  { value: 'ongoing', label: 'Ongoing Project' }
]

export default function PostJob() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm()

  const projectType = watch('project_type')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const user = await AuthProvider.getCurrentUser()
      if (!user) {
        toast.error('Please login to post a job')
        return
      }

      const jobData = {
        ...data,
        client_id: user.id,
        status: 'open',
        skills: data.skills.split(',').map(skill => skill.trim()),
        created_at: new Date().toISOString()
      }

      const { data: job, error } = await createJob(jobData)
      
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Job posted successfully!')
      router.push('/client')
    } catch (error) {
      toast.error('Failed to post job. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['client']}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
              <p className="mt-2 text-gray-600">Find the perfect professional for your project</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-lg shadow-lg"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Briefcase className="h-6 w-6 text-primary-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Job Details</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  {...register('title', { 
                    required: 'Job title is required',
                    minLength: { value: 10, message: 'Title must be at least 10 characters' }
                  })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Full Stack Developer for E-commerce Platform"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Category and Project Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <div className="relative">
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <Tag className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type *
                  </label>
                  <div className="relative">
                    <select
                      {...register('project_type', { required: 'Project type is required' })}
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select project type</option>
                      {projectTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.project_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.project_type.message}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description *
                </label>
                <textarea
                  {...register('description', { 
                    required: 'Description is required',
                    minLength: { value: 100, message: 'Description must be at least 100 characters' }
                  })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe your project requirements, goals, and any specific details..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Skills Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills Required *
                </label>
                <input
                  {...register('skills', { required: 'Skills are required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., React, Node.js, MongoDB, TypeScript (comma-separated)"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter skills separated by commas
                </p>
                {errors.skills && (
                  <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
                )}
              </div>

              {/* Budget and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget *
                  </label>
                  <div className="relative">
                    <input
                      {...register('budget', { 
                        required: 'Budget is required',
                        min: { value: 1, message: 'Budget must be greater than 0' }
                      })}
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your budget"
                    />
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {projectType === 'hourly' ? 'Hourly rate in USD' : 'Total project budget in USD'}
                  </p>
                  {errors.budget && (
                    <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <div className="relative">
                    <input
                      {...register('duration', { required: 'Duration is required' })}
                      type="text"
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., 2 weeks, 1 month, 3 months"
                    />
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                  )}
                </div>
              </div>

              {/* Location and Skill Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <input
                      {...register('location', { required: 'Location is required' })}
                      type="text"
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Remote, New York, USA"
                    />
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level *
                  </label>
                  <div className="relative">
                    <select
                      {...register('experience_level', { required: 'Experience level is required' })}
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select experience level</option>
                      {skillLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                    <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.experience_level && (
                    <p className="mt-1 text-sm text-red-600">{errors.experience_level.message}</p>
                  )}
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Requirements
                </label>
                <textarea
                  {...register('requirements')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Any specific requirements, qualifications, or preferences..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Posting...' : 'Post Job'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  )
}