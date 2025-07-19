import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { AuthProvider } from '../lib/auth'
import { Menu, X, User, LogOut, Settings, Home, Briefcase, Users } from 'lucide-react'

export default function Layout({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const currentUser = await AuthProvider.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      const { data: profileData } = await AuthProvider.getProfile(currentUser.id)
      setProfile(profileData)
    }
  }

  const handleLogout = async () => {
    await AuthProvider.logout()
    setUser(null)
    setProfile(null)
    router.push('/')
  }

  const getNavLinks = () => {
    if (!user || !profile) return []

    const baseLinks = [
      { href: '/', label: 'Home', icon: Home }
    ]

    if (profile.role === 'client') {
      return [
        ...baseLinks,
        { href: '/client', label: 'Dashboard', icon: Briefcase },
        { href: '/post-job', label: 'Post Job', icon: Briefcase }
      ]
    } else if (profile.role === 'worker') {
      return [
        ...baseLinks,
        { href: '/worker', label: 'Dashboard', icon: Briefcase },
        { href: '/jobs', label: 'Find Jobs', icon: Briefcase }
      ]
    } else if (profile.role === 'admin') {
      return [
        ...baseLinks,
        { href: '/admin', label: 'Admin Panel', icon: Users },
        { href: '/jobs', label: 'All Jobs', icon: Briefcase }
      ]
    }

    return baseLinks
  }

  const navLinks = getNavLinks()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-2 rounded-lg">
                  <Briefcase className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900">JobSpark</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      router.pathname === link.href
                        ? 'bg-primary-100 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}

              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">{profile?.full_name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-primary-600 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      router.pathname === link.href
                        ? 'bg-primary-100 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}

              {user ? (
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-700">{profile?.full_name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="border-t pt-4 space-y-1">
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="min-h-screen">
        {children}
      </main>
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2 flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              {/* Placeholder logo */}
              <div className='logo'>
                <Briefcase className="h-32 w-32" />
              </div>
              <span className="text-6xl font-bold text-white">JobsPark</span>
            </div>
            <p className="text-gray-400 max-w-xs">
            Connect skilled professionals with amazing opportunities. 
            Whether you're looking for work or need expert help, 
            JobSpark makes it happen.</p>
          </div>
          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-white mb-3">Navigation</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Home</a></li>
              <li><a href="/register" className="hover:underline">Register</a></li>
              <li><a href="/login" className="hover:underline">Login</a></li>
            </ul>
          </div>
          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-3">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">About Us</a></li>
              <li><a href="#" className="hover:underline">Why JobsPark</a></li>
              <li><a href="mailto:yamlaknegash96@gmail.com" className="hover:underline">Contact</a></li>
            </ul>
          </div>
          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-3">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Blog</a></li>
              <li><a href="#" className="hover:underline">Resources</a></li>
              <li><a href="#" className="hover:underline">Support</a></li>
              <li><a href="#" className="hover:underline">FAQ</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Us */}
            <div>
              <h3 className="font-semibold text-white mb-2">Contact Us</h3>
              <p className="text-gray-400 text-sm">Email: <a href="mailto:yamlaknegash96@gmail.com" className="hover:underline">yamlaknegash96@gmail.com</a></p>
              <p className="text-gray-400 text-sm">Phone: (251) 902142767</p>
              <p className="text-gray-400 text-sm">Address: 9th floor AMG, Mebrat hail, Adama</p>
            </div>
            {/* Follow Us */}
            <div>
              <h3 className="font-semibold text-white mb-2">Follow Us</h3>
              <div className="flex space-x-4 mt-2">
                {/* X (Twitter) */}
                <a href="https://x.com" aria-label="X" className="hover:text-white">
                  <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M17.53 6.47a.75.75 0 0 1 1.06 1.06l-4.72 4.72 4.72 4.72a.75.75 0 1 1-1.06 1.06l-4.72-4.72-4.72 4.72a.75.75 0 1 1-1.06-1.06l4.72-4.72-4.72-4.72a.75.75 0 1 1 1.06-1.06l4.72 4.72 4.72-4.72z"></path></svg>
                </a>
                {/* LinkedIn */}
                <a href="https://linkedin.com" aria-label="LinkedIn" className="hover:text-white">
                  <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z"/></svg>
                </a>
                {/* GitHub */}
                <a href="https://github.com/yamneg96/JPark" aria-label="GitHub" className="hover:text-white">
                  <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.66-.22.66-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85.004 1.71.115 2.51.337 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85 0 1.33-.01 2.4-.01 2.73 0 .27.16.58.67.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}