import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {

  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)

  // Login states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const loginHandler = async (e) => {
    e.preventDefault()

    setMessage('')

    // Check fields
    if (!email || !password) {
      setMessage('Please enter email and password')
      return
    }

    try {

      setLoading(true)

      const response = await fetch(
        'http://localhost:5000/api/auth/login',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            email: email,
            password: password
          })
        }
      )

      const data = await response.json()

      console.log('Backend response:', data)

      // Login failed
      if (!response.ok) {
        setMessage(data.message || 'Login failed')
        return
      }

      // Login successful
      setMessage('Login successful!')

      console.log('User:', data.user)
      console.log('Token:', data.token)

      // Store token
      localStorage.setItem('token', data.token)

      // Store user information
      localStorage.setItem('user', JSON.stringify(data.user))

      // Navigate after login
        setTimeout(() => {
        navigate('/dashboard')
        }, 1000)

    } catch (error) {

      console.log('Login error:', error)

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
            Welcome Back!
          </h1>

          <p className="text-blue-100 text-lg leading-relaxed">
            Login to your Behaviour Analysis account and
            continue exploring meaningful insights.
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

        {/* Login Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12">

          <div className="max-w-md mx-auto">

            <h2 className="text-3xl font-bold text-gray-800">
              Login
            </h2>

            <p className="text-gray-500 mt-2 mb-8">
              Welcome back! Please enter your details.
            </p>

            <form
              onSubmit={loginHandler}
              className="space-y-5"
            >

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

                <div className="flex justify-between items-center mb-2">

                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>

                </div>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between gap-2">

                <div className="flex items-center gap-2">

                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600"
                  />

                  <span className="text-sm text-gray-500">
                    Remember me
                  </span>

                </div>

                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>

              </div>

              {/* Message */}
              {message && (
                <p className="text-center text-sm text-red-600">
                  {message}
                </p>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition duration-200"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

            </form>

            {/* Signup */}
            <p className="text-center text-gray-500 text-sm mt-6">

              Don't have an account?{" "}

              <Link
                to="/signup"
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign Up
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default Login