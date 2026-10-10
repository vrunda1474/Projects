import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'

import { getTransactions } from '../services/api'

const Transactions = () => {

  const navigate = useNavigate()

  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {

    const loadTransactions = async () => {

      try {

        setLoading(true)
        setError('')

        const data = await getTransactions()

        console.log('Transactions:', data)

        setTransactions(
          data.transactions || data || []
        )

      } catch (error) {

        console.error('Transaction error:', error)

        setError(
          error.message || 'Unable to load transactions'
        )

      } finally {

        setLoading(false)

      }

    }

    loadTransactions()

  }, [])

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
                Transactions
              </h1>

            </div>

            <p className="text-gray-500">
              Monitor transactions and identify suspicious activity.
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

            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
              Loading transactions...
            </div>

          ) : (

            <div className="bg-white rounded-xl shadow overflow-hidden">

              {/* Table Header */}
              <div className="p-5 border-b">

                <h2 className="text-xl font-semibold">
                  Transaction Records
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Total transactions: {transactions.length}
                </p>

              </div>


              {/* Table */}
              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="text-left p-4">
                        Transaction ID
                      </th>

                      <th className="text-left p-4">
                        Type
                      </th>

                      <th className="text-left p-4">
                        Amount
                      </th>

                      <th className="text-left p-4">
                        Sender
                      </th>

                      <th className="text-left p-4">
                        Receiver
                      </th>

                      <th className="text-left p-4">
                        Fraud
                      </th>

                      <th className="text-left p-4">
                        Anomaly
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {transactions.length === 0 ? (

                      <tr>

                        <td
                          colSpan="7"
                          className="text-center p-8 text-gray-500"
                        >
                          No transactions found.
                        </td>

                      </tr>

                    ) : (

                      transactions.map((transaction, index) => (

                        <tr
                          key={
                            transaction._id ||
                            transaction.transactionId ||
                            index
                          }
                          className="border-t hover:bg-gray-50"
                        >

                          {/* Transaction ID */}
                          <td className="p-4 font-medium">
                            {transaction.transactionId || '-'}
                          </td>


                          {/* Type */}
                          <td className="p-4">
                            {transaction.type || '-'}
                          </td>


                          {/* Amount */}
                          <td className="p-4">

                            {transaction.amount !== undefined
                              ? `₹${Number(
                                  transaction.amount
                                ).toLocaleString()}`
                              : '-'}

                          </td>


                          {/* Sender */}
                          <td className="p-4">

                            {transaction.sender ||
                              transaction.nameOrig ||
                              '-'}

                          </td>


                          {/* Receiver */}
                          <td className="p-4">

                            {transaction.receiver ||
                              transaction.nameDest ||
                              '-'}

                          </td>


                          {/* Fraud */}
                          <td className="p-4">

                            {transaction.isFraud === 1 ||
                            transaction.isFraud === true ? (

                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-200 text-red-800">
                                Fraud
                              </span>

                            ) : (

                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-200 text-green-800">
                                Normal
                              </span>

                            )}

                          </td>


                          {/* Anomaly */}
                          <td className="p-4">

                            {transaction.anomaly ? (

                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-200 text-orange-800">
                                Anomaly
                              </span>

                            ) : (

                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-200 text-green-800">
                                Normal
                              </span>

                            )}

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

export default Transactions