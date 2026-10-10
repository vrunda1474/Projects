const express = require('express')
const fs = require('fs')
const path = require('path')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.use(authMiddleware)

router.get('/summary', async (req, res) => {
  try {
    const summaryPath = path.join(
      __dirname,
      '..',
      'data',
      'outputs',
      'dashboard_summary.json'
    )

    if (!fs.existsSync(summaryPath)) {
      return res.status(404).json({
        message: 'Dashboard summary has not been generated yet.'
      })
    }

    const summary = JSON.parse(
      fs.readFileSync(summaryPath, 'utf8')
    )

    const totalTransactions =
      summary.dataset?.totalTransactions || 0

    const totalAmount =
      summary.dataset?.totalAmount || 0

    const fraudTransactions =
      summary.fraud?.fraudTransactions || 0

    const flaggedFraudTransactions =
      summary.fraud?.flaggedFraudTransactions || 0

    const suspiciousTransactions =
      summary.fraud?.suspiciousTransactions || 0

    const balanceMismatchTransactions =
      summary.anomaly?.balanceMismatchTransactions || 0

    res.json({
      totalTransactions,

      totalAnomalies:
        balanceMismatchTransactions,

      suspiciousTransactions,

      highRiskAnomalies:
        fraudTransactions,

      fraudTransactions,

      averageAnomalyScore: 0,

      flaggedFraudTransactions,

      totalAmount
    })

  } catch (error) {
    console.error(
      'Dashboard error:',
      error.message
    )

    res.status(500).json({
      message: 'Unable to load dashboard summary.'
    })
  }
})

module.exports = router