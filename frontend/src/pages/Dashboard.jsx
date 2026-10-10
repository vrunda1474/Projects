import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import StatCard from '../components/StartCard.jsx'

import { getDashboardSummary } from '../services/api.js'

const Dashboard = () => {
  const navigate = useNavigate()

  const [data, setData] = useState({
    totalTransactions: 0,
    totalAnomalies: 0,
    suspiciousTransactions: 0,
    highRiskAnomalies: 0,
    fraudTransactions: 0,
    averageAnomalyScore: 0
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const result = await getDashboardSummary()

        console.log('Dashboard data:', result)

        setData(result)
      } catch (error) {
        console.error('Dashboard error:', error)

        setError(error.message || 'Unable to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-100 flex">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <main className="p-8">

          {/* Header */}

          <div className="mb-8">

            <h1 className="text-3xl font-bold text-gray-800">
              Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Monitor suspicious behaviour and coordinated activity.
            </p>

          </div>


          {/* Error */}

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}


          {/* Loading */}

          {loading ? (

            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
              Loading dashboard...
            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

              <StatCard
                title="Total Transactions"
                value={data.totalTransactions}
                description="Total processed transactions"
              />

              <StatCard
                title="Total Anomalies"
                value={data.totalAnomalies}
                description="Detected anomaly records"
              />

              <StatCard
                title="Suspicious Transactions"
                value={data.suspiciousTransactions}
                description="Transactions flagged as suspicious"
              />

              <StatCard
                title="High Risk"
                value={data.highRiskAnomalies}
                description="High and critical risk anomalies"
              />

            </div>

          )}


          {/* Additional Statistics */}

          {!loading && (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

              <div className="bg-white rounded-xl shadow p-6">

                <p className="text-sm text-gray-500">
                  Fraud Transactions
                </p>

                <h2 className="text-3xl font-bold text-red-600 mt-2">
                  {data.fraudTransactions}
                </h2>

                <p className="text-sm text-gray-400 mt-2">
                  Transactions marked as fraud
                </p>

              </div>


              <div className="bg-white rounded-xl shadow p-6">

                <p className="text-sm text-gray-500">
                  Average Anomaly Score
                </p>

                <h2 className="text-3xl font-bold text-orange-600 mt-2">
                  {data.averageAnomalyScore}
                </h2>

                <p className="text-sm text-gray-400 mt-2">
                  Average score from detected anomalies
                </p>

              </div>

            </div>

          )}


          {/* Analytics */}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">


            {/* Coordination Scores */}

            <div className="bg-white rounded-xl shadow overflow-hidden">

              <div className="p-5 border-b">

                <h2 className="font-semibold text-lg">
                  Coordination Scores
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Coordination analysis from Python analytics
                </p>

              </div>

              <iframe
                src="http://localhost:5000/analytics/dashboard_chart_scores.html"
                title="Coordination Scores"
                className="w-full h-[450px]"
              />

            </div>


            {/* Temporal Analysis */}

            <div className="bg-white rounded-xl shadow overflow-hidden">

              <div className="p-5 border-b">

                <h2 className="font-semibold text-lg">
                  Temporal Analysis
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Time-based suspicious behaviour
                </p>

              </div>

              <iframe
                src="http://localhost:5000/analytics/dashboard_chart_temporal.html"
                title="Temporal Analysis"
                className="w-full h-[450px]"
              />

            </div>

          </div>


          {/* Anomaly Analysis */}

          <div className="bg-white rounded-xl shadow overflow-hidden mt-6">

            <div className="p-5 border-b">

              <h2 className="font-semibold text-lg">
                Anomaly Analysis
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Detailed anomaly detection results
              </p>

            </div>

            <iframe
              src="http://localhost:5000/analytics/dashboard_anomalies.html"
              title="Anomaly Analysis"
              className="w-full h-[500px]"
            />

          </div>

        </main>

      </div>

    </div>
  )
}

export default Dashboard