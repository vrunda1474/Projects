const mongoose = require('mongoose')

const anomalySchema = new mongoose.Schema(
  {
    anomalyId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    entityType: {
      type: String,
      enum: ['transaction', 'account', 'group'],
      required: true
    },
    entityId: {
      type: String,
      required: true,
      trim: true
    },
    anomalyType: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    anomalyScore: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    coordinationScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    relatedAccounts: {
      type: [String],
      default: []
    },
    relatedTransactions: {
      type: [String],
      default: []
    },
    detectionMethod: {
      type: String,
      default: 'unknown'
    },
    detectedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['new', 'investigating', 'resolved', 'false_positive'],
      default: 'new'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
)

anomalySchema.index({ riskLevel: 1, status: 1 })
anomalySchema.index({ entityType: 1, entityId: 1 })
anomalySchema.index({ detectedAt: -1 })

module.exports = mongoose.model('Anomaly', anomalySchema)