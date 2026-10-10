import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
const Signup = () => {

      const navigate = useNavigate()
  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // UI states
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Signup function
  const signupHandler = async (e) => {
    e.preventDefault()

    setMessage('')

    // Check empty fields
    if (!name || !email || !password || !confirmPassword) {
      setMessage('Please fill all fields')
      return
    }

    // Check password
    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      return
    }

    try {

      setLoading(true)

      const response = await fetch(
        'http://localhost:5000/api/auth/signup',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            name: name,
            email: email,
            password: password
          })
        }
      )

      const data = await response.json()

      console.log('Backend response:', data)

      if (!response.ok) {
        setMessage(data.message || 'Signup failed')
        return
      }

      setMessage('Account created successfully!')

      // Clear form
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setTimeout(() => {
         navigate('/login')
        }, 1000)

    } catch (error) {

      console.log('Signup error:', error)

      setMessage('Unable to connect to server')

    } finally {

      setLoading(false)

    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex">

        {/* Left Side */}
        <div className="hidden md:flex md:w-1/2 bg-blue-600 text-white p-12 flex-col justify-center">

          <h1 className="text-4xl font-bold mb-4">
            Welcome to Behaviour Analysis
          </h1>

          <p className="text-blue-100 text-lg leading-relaxed">
            Create your account and start exploring our behaviour
            analysis platform.
          </p>

          <div className="mt-8 space-y-4">

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                ✓
              </div>
              <span>Analyze behavioural patterns</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                ✓
              </div>
              <span>Track your activities</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                ✓
              </div>
              <span>Get meaningful insights</span>
            </div>

          </div>

        </div>


        {/* Signup Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12">

          <div className="max-w-md mx-auto">

            <h2 className="text-3xl font-bold text-gray-800">
              Create Account
            </h2>

            <p className="text-gray-500 mt-2 mb-8">
              Sign up to get started
            </p>


            <form
              onSubmit={signupHandler}
              className="space-y-5"
            >

              {/* Name */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />

              </div>


              {/* Email */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />

              </div>


              {/* Password */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>

                </div>

              </div>


            {/* Confirm Password */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
            </label>

            <div className="relative">
                <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />

                <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:text-blue-800"
                >
                {showPassword ? 'Hide' : 'Show'}
                </button>
            </div>
            </div>




              {/* Message */}
              {message && (
                <p className="text-center text-sm text-red-500">
                  {message}
                </p>
              )}


              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition duration-200"
              >

                {loading
                  ? 'Creating Account...'
                  : 'Create Account'
                }

              </button>

            </form>


            {/* Login */}
            <p className="text-center text-gray-500 text-sm mt-6">

              Already have an account?{' '}

              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:underline"
              >
                Login
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Signup