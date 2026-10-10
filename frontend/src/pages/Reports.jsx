import React from 'react'
import { useNavigate } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'

const Reports = () => {

  const navigate = useNavigate()

  return (

    <div className="min-h-screen bg-gray-100 flex">

      {/* Sidebar */}
      <Sidebar />

      <div className="flex-1">

        {/* Top Navbar */}
        <Navbar />

        <main className="p-8">

          {/* Header */}
          <div className="mb-8">

            <div className="flex items-center gap-4 mb-4">

              {/* Back Button */}
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                ← Dashboard
              </button>

              <h1 className="text-3xl font-bold text-gray-800">
                Reports
              </h1>

            </div>

            <p className="text-gray-500">
              View detailed behaviour analysis and anomaly reports.
            </p>

          </div>


          {/* Coordination Scores */}
          <div className="bg-white rounded-xl shadow overflow-hidden mb-6">

            <div className="p-5 border-b">

              <h2 className="text-xl font-semibold text-gray-800">
                Coordination Scores
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Coordination analysis from Python analytics.
              </p>

            </div>

            <iframe
              src="http://localhost:5000/analytics/dashboard_chart_scores.html"
              title="Coordination Scores"
              className="w-full h-[500px]"
            />

          </div>


          {/* Temporal Analysis */}
          <div className="bg-white rounded-xl shadow overflow-hidden mb-6">

            <div className="p-5 border-b">

              <h2 className="text-xl font-semibold text-gray-800">
                Temporal Analysis
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Time-based suspicious behaviour analysis.
              </p>

            </div>

            <iframe
              src="http://localhost:5000/analytics/dashboard_chart_temporal.html"
              title="Temporal Analysis"
              className="w-full h-[500px]"
            />

          </div>


          {/* Anomaly Analysis */}
          <div className="bg-white rounded-xl shadow overflow-hidden">

            <div className="p-5 border-b">

              <h2 className="text-xl font-semibold text-gray-800">
                Anomaly Analysis
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Detailed anomaly detection results.
              </p>

            </div>

            <iframe
              src="http://localhost:5000/analytics/dashboard_anomalies.html"
              title="Anomaly Analysis"
              className="w-full h-[550px]"
            />

          </div>

        </main>

      </div>

    </div>

  )
}

export default Reports