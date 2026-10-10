const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    step: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    nameOrig: {
      type: String,
      required: true,
      trim: true
    },
    oldBalanceOrig: {
      type: Number,
      default: 0,
      min: 0
    },
    newBalanceOrig: {
      type: Number,
      default: 0,
      min: 0
    },
    nameDest: {
      type: String,
      required: true,
      trim: true
    },
    oldBalanceDest: {
      type: Number,
      default: 0,
      min: 0
    },
    newBalanceDest: {
      type: Number,
      default: 0,
      min: 0
    },
    isFraud: {
      type: Boolean,
      default: false
    },
    isFlaggedFraud: {
      type: Boolean,
      default: false
    },
    anomalyDetected: {
      type: Boolean,
      default: false
    },
    anomalyScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    }
  },
  { timestamps: true }
)

transactionSchema.index({ nameOrig: 1 })
transactionSchema.index({ nameDest: 1 })
transactionSchema.index({ anomalyDetected: 1 })
transactionSchema.index({ step: 1 })

module.exports = mongoose.model('Transaction', transactionSchema)