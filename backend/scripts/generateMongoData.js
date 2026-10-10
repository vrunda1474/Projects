const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

const Transaction = require('../models/Transaction')
const Anomaly = require('../models/Anomaly')

dotenv.config()

// =====================================================
// CONFIGURATION
// =====================================================

const inputFile = path.join(
  __dirname,
  '..',
  'data',
  'raw',
  'PS_20174392719_1491204439457_log.csv'
)

// Maximum records stored in MongoDB
const MAX_TRANSACTIONS = 100000
const MAX_ANOMALIES = 20000

// MongoDB insert batch size
const BATCH_SIZE = 1000

// We keep some normal records and all fraud records
const NORMAL_SAMPLE_LIMIT = 95000

// =====================================================
// COUNTERS
// =====================================================

let normalTransactions = []
let fraudTransactions = []

let anomalyRecords = []

let rowsRead = 0
let fraudCount = 0
let flaggedFraudCount = 0

// =====================================================
// INSERT BATCH
// =====================================================

const insertTransactions = async (transactions) => {
  if (transactions.length === 0) {
    return
  }

  await Transaction.bulkWrite(
    transactions.map((transaction) => ({
      updateOne: {
        filter: {
          transactionId: transaction.transactionId
        },
        update: {
          $set: transaction
        },
        upsert: true
      }
    })),
    {
      ordered: false
    }
  )
}

const insertAnomalies = async (anomalies) => {
  if (anomalies.length === 0) {
    return
  }

  await Anomaly.bulkWrite(
    anomalies.map((anomaly) => ({
      updateOne: {
        filter: {
          anomalyId: anomaly.anomalyId
        },
        update: {
          $set: anomaly
        },
        upsert: true
      }
    })),
    {
      ordered: false
    }
  )
}

// =====================================================
// CREATE TRANSACTION OBJECT
// =====================================================

const createTransaction = (row, rowNumber) => {
  const step = Number(row.step) || 0

  const amount = Number(row.amount) || 0

  const oldBalanceOrig =
    Number(row.oldbalanceOrg) || 0

  const newBalanceOrig =
    Number(row.newbalanceOrig) || 0

  const oldBalanceDest =
    Number(row.oldbalanceDest) || 0

  const newBalanceDest =
    Number(row.newbalanceDest) || 0

  const isFraud =
    String(row.isFraud).trim() === '1'

  const isFlaggedFraud =
    String(row.isFlaggedFraud).trim() === '1'

  // Detect unusual origin balance behaviour
  const balanceMismatch =
    amount > 0 &&
    oldBalanceOrig > 0 &&
    Math.abs(
      oldBalanceOrig -
        amount -
        newBalanceOrig
    ) > 0.01

  // Suspicious transaction
  const anomalyDetected =
    isFraud ||
    isFlaggedFraud ||
    balanceMismatch

  // ===================================================
  // ANOMALY SCORE
  // ===================================================

  let anomalyScore = 0

  if (isFraud) {
    anomalyScore += 0.7
  }

  if (isFlaggedFraud) {
    anomalyScore += 0.2
  }

  if (balanceMismatch) {
    anomalyScore += 0.2
  }

  anomalyScore = Math.min(
    anomalyScore,
    1
  )

  return {
    transactionId: `TX-${rowNumber}`,

    step,

    type:
      row.type ||
      'UNKNOWN',

    amount,

    nameOrig:
      row.nameOrig ||
      'UNKNOWN',

    oldBalanceOrig,

    newBalanceOrig,

    nameDest:
      row.nameDest ||
      'UNKNOWN',

    oldBalanceDest,

    newBalanceDest,

    isFraud,

    isFlaggedFraud,

    anomalyDetected,

    anomalyScore
  }
}

// =====================================================
// CREATE ANOMALY OBJECT
// =====================================================

const createAnomaly = (
  transaction,
  rowNumber
) => {
  let anomalyType =
    'Suspicious Transaction'

  if (transaction.isFraud) {
    anomalyType =
      'Fraudulent Transaction'
  } else if (
    transaction.isFlaggedFraud
  ) {
    anomalyType =
      'Flagged Fraud'
  } else {
    anomalyType =
      'Balance Anomaly'
  }

  let riskLevel = 'medium'

  if (
    transaction.anomalyScore >= 0.8
  ) {
    riskLevel = 'critical'
  } else if (
    transaction.anomalyScore >= 0.6
  ) {
    riskLevel = 'high'
  } else if (
    transaction.anomalyScore >= 0.3
  ) {
    riskLevel = 'medium'
  } else {
    riskLevel = 'low'
  }

  return {
    anomalyId:
      `AN-${rowNumber}`,

    entityType:
      'transaction',

    entityId:
      transaction.transactionId,

    anomalyType,

    description:
      `Suspicious ${transaction.type} transaction detected.`,

    riskLevel,

    anomalyScore:
      transaction.anomalyScore,

    coordinationScore: 0,

    relatedAccounts: [
      transaction.nameOrig,
      transaction.nameDest
    ],

    relatedTransactions: [
      transaction.transactionId
    ],

    detectionMethod:
      'CSV fraud analysis',

    detectedAt:
      new Date(),

    status:
      'new'
  }
}

// =====================================================
// MAIN FUNCTION
// =====================================================

const importData = async () => {
  try {
    // -------------------------------------------------
    // Check CSV
    // -------------------------------------------------

    if (!fs.existsSync(inputFile)) {
      throw new Error(
        `CSV file not found:\n${inputFile}`
      )
    }

    console.log('')
    console.log(
      '========================================'
    )
    console.log(
      'Behaviour Analysis Data Import'
    )
    console.log(
      '========================================'
    )

    console.log('')
    console.log(
      'CSV:',
      inputFile
    )

    console.log('')
    console.log(
      `Maximum transactions: ${MAX_TRANSACTIONS.toLocaleString()}`
    )

    console.log(
      `Maximum anomalies: ${MAX_ANOMALIES.toLocaleString()}`
    )

    console.log('')

    // -------------------------------------------------
    // Connect MongoDB
    // -------------------------------------------------

    console.log(
      'Connecting to MongoDB...'
    )

    await mongoose.connect(
      process.env.MONGO_URI
    )

    console.log(
      'MongoDB connected successfully.'
    )

    console.log('')

    // -------------------------------------------------
    // Read CSV
    // -------------------------------------------------

    const stream = fs
      .createReadStream(inputFile)
      .pipe(csv())

    for await (const row of stream) {
      rowsRead++

      // -----------------------------------------------
      // Stop after enough useful data
      // -----------------------------------------------

      const totalSelected =
        normalTransactions.length +
        fraudTransactions.length

      /*
       * We don't stop immediately at 100k because
       * we want to continue looking for fraud records.
       *
       * We stop after:
       *
       * 95,000 normal records
       * +
       * up to 5,000 fraud records
       */

      if (
        normalTransactions.length >=
          NORMAL_SAMPLE_LIMIT &&
        fraudTransactions.length >=
          MAX_TRANSACTIONS -
            NORMAL_SAMPLE_LIMIT
      ) {
        break
      }

      // -----------------------------------------------
      // Create transaction
      // -----------------------------------------------

      const transaction =
        createTransaction(
          row,
          rowsRead
        )

      // -----------------------------------------------
      // Count fraud
      // -----------------------------------------------

      if (transaction.isFraud) {
        fraudCount++

        /*
         * Keep fraud transactions first.
         */
        if (
          fraudTransactions.length <
          (
            MAX_TRANSACTIONS -
            NORMAL_SAMPLE_LIMIT
          )
        ) {
          fraudTransactions.push(
            transaction
          )
        }
      }

      // -----------------------------------------------
      // Count flagged fraud
      // -----------------------------------------------

      if (
        transaction.isFlaggedFraud
      ) {
        flaggedFraudCount++
      }

      // -----------------------------------------------
      // Keep normal transactions
      // -----------------------------------------------

      if (
        !transaction.isFraud &&
        !transaction.isFlaggedFraud
      ) {
        if (
          normalTransactions.length <
          NORMAL_SAMPLE_LIMIT
        ) {
          normalTransactions.push(
            transaction
          )
        }
      }

      // -----------------------------------------------
      // Create anomaly
      // -----------------------------------------------

      /*
       * Only create anomaly records for actual
       * fraud or flagged fraud.
       *
       * This prevents millions of anomaly documents.
       */

      if (
        (
          transaction.isFraud ||
          transaction.isFlaggedFraud
        ) &&
        anomalyRecords.length <
          MAX_ANOMALIES
      ) {
        anomalyRecords.push(
          createAnomaly(
            transaction,
            rowsRead
          )
        )
      }

      // -----------------------------------------------
      // Progress
      // -----------------------------------------------

      if (
        rowsRead % 100000 === 0
      ) {
        console.log(
          `Rows scanned: ${rowsRead.toLocaleString()}`
        )

        console.log(
          `Normal selected: ${normalTransactions.length.toLocaleString()}`
        )

        console.log(
          `Fraud selected: ${fraudTransactions.length.toLocaleString()}`
        )

        console.log(
          `Anomalies selected: ${anomalyRecords.length.toLocaleString()}`
        )

        console.log(
          '----------------------------------------'
        )
      }
    }

    // =================================================
    // COMBINE DATA
    // =================================================

    const selectedTransactions = [
      ...normalTransactions,
      ...fraudTransactions
    ]

    /*
     * Safety limit
     */

    const finalTransactions =
      selectedTransactions.slice(
        0,
        MAX_TRANSACTIONS
      )

    console.log('')
    console.log(
      'CSV scanning completed.'
    )

    console.log('')
    console.log(
      `Rows scanned: ${rowsRead.toLocaleString()}`
    )

    console.log(
      `Normal transactions: ${normalTransactions.length.toLocaleString()}`
    )

    console.log(
      `Fraud transactions selected: ${fraudTransactions.length.toLocaleString()}`
    )

    console.log(
      `Final transactions: ${finalTransactions.length.toLocaleString()}`
    )

    console.log(
      `Anomalies selected: ${anomalyRecords.length.toLocaleString()}`
    )

    console.log('')
    console.log(
      'Starting MongoDB import...'
    )

    // =================================================
    // IMPORT TRANSACTIONS
    // =================================================

    for (
      let i = 0;
      i < finalTransactions.length;
      i += BATCH_SIZE
    ) {
      const batch =
        finalTransactions.slice(
          i,
          i + BATCH_SIZE
        )

      await insertTransactions(
        batch
      )

      const imported =
        Math.min(
          i + BATCH_SIZE,
          finalTransactions.length
        )

      if (
        imported % 10000 === 0 ||
        imported ===
          finalTransactions.length
      ) {
        console.log(
          `Transactions imported: ${imported.toLocaleString()} / ${finalTransactions.length.toLocaleString()}`
        )
      }
    }

    // =================================================
    // IMPORT ANOMALIES
    // =================================================

    for (
      let i = 0;
      i < anomalyRecords.length;
      i += BATCH_SIZE
    ) {
      const batch =
        anomalyRecords.slice(
          i,
          i + BATCH_SIZE
        )

      await insertAnomalies(
        batch
      )

      const imported =
        Math.min(
          i + BATCH_SIZE,
          anomalyRecords.length
        )

      if (
        imported % 5000 === 0 ||
        imported ===
          anomalyRecords.length
      ) {
        console.log(
          `Anomalies imported: ${imported.toLocaleString()} / ${anomalyRecords.length.toLocaleString()}`
        )
      }
    }

    // =================================================
    // FINAL
    // =================================================

    console.log('')
    console.log(
      '========================================'
    )

    console.log(
      'IMPORT COMPLETED SUCCESSFULLY'
    )

    console.log(
      '========================================'
    )

    console.log('')
    console.log(
      `Transactions in sample: ${finalTransactions.length.toLocaleString()}`
    )

    console.log(
      `Anomalies in sample: ${anomalyRecords.length.toLocaleString()}`
    )

    console.log(
      `Fraud rows found while scanning: ${fraudCount.toLocaleString()}`
    )

    console.log(
      `Flagged fraud rows found: ${flaggedFraudCount.toLocaleString()}`
    )

    console.log('')

    await mongoose.disconnect()

    console.log(
      'MongoDB connection closed.'
    )

    console.log('')
    console.log(
      'You can now open the React dashboard.'
    )

  } catch (error) {
    console.error('')
    console.error(
      '========================================'
    )

    console.error(
      'IMPORT FAILED'
    )

    console.error(
      '========================================'
    )

    console.error(
      error.message
    )

    console.error('')

    try {
      await mongoose.disconnect()
    } catch {}

    process.exit(1)
  }
}

// =====================================================
// START
// =====================================================

importData()