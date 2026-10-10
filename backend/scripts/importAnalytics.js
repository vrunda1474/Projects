const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const Transaction = require('../models/Transaction')
const Anomaly = require('../models/Anomaly')

const processedDir = path.join(__dirname, '..', 'data', 'processed')

const readJsonArray = (filename) => {
  const filePath = path.join(processedDir, filename)

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`)
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))

  if (!Array.isArray(data)) {
    throw new Error(`${filename} must contain a JSON array.`)
  }

  return data
}

const importData = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing from backend/.env')
  }

  await mongoose.connect(process.env.MONGO_URI)
  console.log('MongoDB connected')

  const transactions = readJsonArray('transactions.json')
  const anomalies = readJsonArray('anomalies.json')

  if (transactions.length) {
    const operations = transactions.map((item) => {
      if (!item.transactionId) {
        throw new Error('Every transaction needs a transactionId.')
      }

      return {
        updateOne: {
          filter: { transactionId: String(item.transactionId) },
          update: { $set: item },
          upsert: true
        }
      }
    })

    const result = await Transaction.bulkWrite(operations, {
      ordered: false
    })

    console.log('Transaction import complete:', {
      received: transactions.length,
      inserted: result.upsertedCount,
      updated: result.modifiedCount
    })
  }

  if (anomalies.length) {
    const operations = anomalies.map((item) => {
      if (!item.anomalyId) {
        throw new Error('Every anomaly needs an anomalyId.')
      }

      return {
        updateOne: {
          filter: { anomalyId: String(item.anomalyId) },
          update: { $set: item },
          upsert: true
        }
      }
    })

    const result = await Anomaly.bulkWrite(operations, {
      ordered: false
    })

    console.log('Anomaly import complete:', {
      received: anomalies.length,
      inserted: result.upsertedCount,
      updated: result.modifiedCount
    })
  }

  console.log('Import finished')
}

importData()
  .catch((error) => {
    console.error('Import failed:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })