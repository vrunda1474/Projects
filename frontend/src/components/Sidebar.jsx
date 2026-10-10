import React from 'react'

import {
  Link,
  useNavigate
} from 'react-router-dom'

const Sidebar = () => {

  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white p-6">

      <h1 className="text-2xl font-bold mb-10">
        COBRA
      </h1>

      <nav className="space-y-3">

        {/* Dashboard */}
        <Link
          to="/dashboard"
          className="block px-4 py-3 rounded-lg hover:bg-gray-800"
        >
          Dashboard
        </Link>

        {/* Anomalies */}
        <Link
          to="/anomalies"
          className="block px-4 py-3 rounded-lg hover:bg-gray-800"
        >
          Anomalies
        </Link>

        {/* Transactions */}
        <Link
          to="/transactions"
          className="block px-4 py-3 rounded-lg hover:bg-gray-800"
        >
          Transactions
        </Link>

        {/* Reports */}
        <Link
          to="/reports"
          className="block px-4 py-3 rounded-lg hover:bg-gray-800"
        >
          Reports
        </Link>

      </nav>

      <button
        onClick={logout}
        className="w-full mt-10 bg-red-600 hover:bg-red-700 py-3 rounded-lg"
      >
        Logout
      </button>

    </aside>
  )
}

export default Sidebar