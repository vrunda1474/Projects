const express = require('express')
const Anomaly = require('../models/Anomaly')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.use(authMiddleware)

const validStatuses = [
  'new',
  'investigating',
  'resolved',
  'false_positive'
]

// GET /api/anomalies
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 20)
    )

    const filter = {}

    if (req.query.riskLevel) {
      const allowedRiskLevels = ['low', 'medium', 'high', 'critical']

      if (!allowedRiskLevels.includes(req.query.riskLevel)) {
        return res.status(400).json({
          message: 'Invalid risk level.'
        })
      }

      filter.riskLevel = req.query.riskLevel
    }

    if (req.query.status) {
      if (!validStatuses.includes(req.query.status)) {
        return res.status(400).json({
          message: 'Invalid anomaly status.'
        })
      }

      filter.status = req.query.status
    }

    if (req.query.entityType) {
      const allowedTypes = ['transaction', 'account', 'group']

      if (!allowedTypes.includes(req.query.entityType)) {
        return res.status(400).json({
          message: 'Invalid entity type.'
        })
      }

      filter.entityType = req.query.entityType
    }

    const [anomalies, total] = await Promise.all([
      Anomaly.find(filter)
        .sort({ detectedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Anomaly.countDocuments(filter)
    ])

    res.json({
      anomalies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Anomalies error:', error.message)
    res.status(500).json({
      message: 'Unable to load anomalies.'
    })
  }
})

// GET /api/anomalies/:id
router.get('/:id', async (req, res) => {
  try {
    const anomaly = await Anomaly.findOne({
      anomalyId: req.params.id
    }).lean()

    if (!anomaly) {
      return res.status(404).json({
        message: 'Anomaly not found.'
      })
    }

    res.json({ anomaly })
  } catch (error) {
    console.error('Anomaly details error:', error.message)
    res.status(500).json({
      message: 'Unable to load anomaly details.'
    })
  }
})

// PATCH /api/anomalies/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${validStatuses.join(', ')}`
      })
    }

    const anomaly = await Anomaly.findOneAndUpdate(
      { anomalyId: req.params.id },
      {
        $set: {
          status,
          reviewedBy: req.user._id,
          reviewedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    )

    if (!anomaly) {
      return res.status(404).json({
        message: 'Anomaly not found.'
      })
    }

    res.json({
      message: 'Anomaly status updated.',
      anomaly
    })
  } catch (error) {
    console.error('Update anomaly error:', error.message)
    res.status(500).json({
      message: 'Unable to update anomaly status.'
    })
  }
})

module.exports = router