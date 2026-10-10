const express = require('express')
const Transaction = require('../models/Transaction')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.use(authMiddleware)

// GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 20)
    )

    const filter = {}

    if (req.query.type) {
      filter.type = req.query.type
    }

    if (req.query.suspicious === 'true') {
      filter.anomalyDetected = true
    } else if (req.query.suspicious === 'false') {
      filter.anomalyDetected = false
    }

    if (req.query.fraud === 'true') {
      filter.isFraud = true
    } else if (req.query.fraud === 'false') {
      filter.isFraud = false
    }

    if (req.query.search) {
      const search = req.query.search.trim().slice(0, 100)
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const searchRegex = new RegExp(escapedSearch, 'i')

      filter.$or = [
        { transactionId: searchRegex },
        { nameOrig: searchRegex },
        { nameDest: searchRegex }
      ]
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter)
    ])

    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Transactions error:', error.message)
    res.status(500).json({
      message: 'Unable to load transactions.'
    })
  }
})

// GET /api/transactions/:id
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      transactionId: req.params.id
    }).lean()

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found.'
      })
    }

    res.json({ transaction })
  } catch (error) {
    console.error('Transaction details error:', error.message)
    res.status(500).json({
      message: 'Unable to load transaction details.'
    })
  }
})

module.exports = router