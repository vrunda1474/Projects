import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'

import { getAnomalies } from '../services/api'

const Anomalies = () => {

  const navigate = useNavigate()

  const [anomalies, setAnomalies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {

    const loadAnomalies = async () => {

      try {

        setLoading(true)
        setError('')

        const data = await getAnomalies()

        console.log('Anomalies:', data)

        setAnomalies(data.anomalies || data || [])

      } catch (error) {

        console.error('Anomaly error:', error)

        setError(
          error.message || 'Unable to load anomalies'
        )

      } finally {

        setLoading(false)

      }

    }

    loadAnomalies()

  }, [])

  const getRiskClass = (risk) => {

    if (risk === 'critical') {
      return 'bg-red-200 text-red-800'
    }

    if (risk === 'high') {
      return 'bg-orange-200 text-orange-800'
    }

    if (risk === 'medium') {
      return 'bg-yellow-200 text-yellow-800'
    }

    return 'bg-green-200 text-green-800'
  }

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
                Anomalies
              </h1>

            </div>

            <p className="text-gray-500">
              Investigate suspicious behaviour and detected anomalies.
            </p>

          </div>


          {/* Error */}
          {error && (

            <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>

          )}


          {/* Loading */}
          {loading ? (

            <div className="bg-white rounded-xl shadow p-8 text-center">
              Loading anomalies...
            </div>

          ) : (

            <div className="bg-white rounded-xl shadow overflow-hidden">

              {/* Table Header */}
              <div className="p-5 border-b">

                <h2 className="text-xl font-semibold">
                  Detected Anomalies
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Total anomalies: {anomalies.length}
                </p>

              </div>


              {/* Table */}
              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="text-left p-4">
                        Anomaly ID
                      </th>

                      <th className="text-left p-4">
                        Entity
                      </th>

                      <th className="text-left p-4">
                        Type
                      </th>

                      <th className="text-left p-4">
                        Risk
                      </th>

                      <th className="text-left p-4">
                        Score
                      </th>

                      <th className="text-left p-4">
                        Status
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {anomalies.length === 0 ? (

                      <tr>

                        <td
                          colSpan="6"
                          className="text-center p-8 text-gray-500"
                        >
                          No anomalies found.
                        </td>

                      </tr>

                    ) : (

                      anomalies.map((anomaly, index) => (

                        <tr
                          key={
                            anomaly._id ||
                            anomaly.anomalyId ||
                            index
                          }
                          className="border-t hover:bg-gray-50"
                        >

                          {/* Anomaly ID */}
                          <td className="p-4 font-medium">
                            {anomaly.anomalyId || '-'}
                          </td>


                          {/* Entity */}
                          <td className="p-4">

                            <div>
                              {anomaly.entityType || '-'}
                            </div>

                            <div className="text-xs text-gray-500">
                              {anomaly.entityId || '-'}
                            </div>

                          </td>


                          {/* Type */}
                          <td className="p-4">
                            {anomaly.anomalyType || '-'}
                          </td>


                          {/* Risk */}
                          <td className="p-4">

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskClass(
                                anomaly.riskLevel
                              )}`}
                            >
                              {anomaly.riskLevel || 'unknown'}
                            </span>

                          </td>


                          {/* Score */}
                          <td className="p-4">

                            {anomaly.anomalyScore !== undefined
                              ? Number(
                                  anomaly.anomalyScore
                                ).toFixed(3)
                              : '-'}

                          </td>


                          {/* Status */}
                          <td className="p-4">
                            {anomaly.status || '-'}
                          </td>

                        </tr>

                      ))

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        </main>

      </div>

    </div>

  )
}

export default Anomalies