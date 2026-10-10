const fs = require('fs')
const path = require('path')
const readline = require('readline')

const csvPath = path.join(
  __dirname,
  '..',
  'data',
  'raw',
  'PS_20174392719_1491204439457_log.csv'
)

const outputDir = path.join(
  __dirname,
  '..',
  'data',
  'outputs'
)

const outputPath = path.join(
  outputDir,
  'dashboard_summary.json'
)

const generateSummary = async () => {
  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found:')
    console.error(csvPath)
    process.exit(1)
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  console.log('Reading CSV...')
  console.log(csvPath)

  const fileStream = fs.createReadStream(csvPath)

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  let header = null

  let totalTransactions = 0
  let fraudTransactions = 0
  let flaggedFraudTransactions = 0

  let totalAmount = 0

  let balanceMismatchTransactions = 0

  for await (const line of rl) {
    if (!header) {
      header = line.split(',')
      console.log('CSV Header detected')
      continue
    }

    if (!line.trim()) {
      continue
    }

    const columns = line.split(',')

    if (columns.length < 11) {
      continue
    }

    /*
      Dataset columns:

      step
      type
      amount
      nameOrig
      oldbalanceOrg
      newbalanceOrig
      nameDest
      oldbalanceDest
      newbalanceDest
      isFraud
      isFlaggedFraud
    */

    const amount = Number(columns[2]) || 0

    const oldBalanceOrig = Number(columns[4]) || 0
    const newBalanceOrig = Number(columns[5]) || 0

    const oldBalanceDest = Number(columns[7]) || 0
    const newBalanceDest = Number(columns[8]) || 0

    const isFraud = Number(columns[9]) === 1
    const isFlaggedFraud = Number(columns[10]) === 1

    totalTransactions++

    totalAmount += amount

    if (isFraud) {
      fraudTransactions++
    }

    if (isFlaggedFraud) {
      flaggedFraudTransactions++
    }

    /*
      Simple balance consistency check.

      Sender:
      old balance - amount ≈ new balance

      Receiver:
      old balance + amount ≈ new balance
    */

    const senderExpectedBalance =
      oldBalanceOrig - amount

    const receiverExpectedBalance =
      oldBalanceDest + amount

    const senderMismatch =
      Math.abs(senderExpectedBalance - newBalanceOrig) > 0.01

    const receiverMismatch =
      Math.abs(receiverExpectedBalance - newBalanceDest) > 0.01

    if (senderMismatch || receiverMismatch) {
      balanceMismatchTransactions++
    }

    if (totalTransactions % 500000 === 0) {
      console.log(
        `Processed ${totalTransactions.toLocaleString()} transactions...`
      )
    }
  }

  const suspiciousTransactions =
    fraudTransactions + flaggedFraudTransactions

  const summary = {
    generatedAt: new Date().toISOString(),

    dataset: {
      totalTransactions,
      totalAmount
    },

    fraud: {
      fraudTransactions,
      flaggedFraudTransactions,
      suspiciousTransactions
    },

    anomaly: {
      balanceMismatchTransactions
    }
  }

  fs.writeFileSync(
    outputPath,
    JSON.stringify(summary, null, 2)
  )

  console.log('\n================================')
  console.log('Dashboard summary generated')
  console.log('================================')

  console.log(
    'Total Transactions:',
    totalTransactions.toLocaleString()
  )

  console.log(
    'Fraud Transactions:',
    fraudTransactions.toLocaleString()
  )

  console.log(
    'Flagged Fraud:',
    flaggedFraudTransactions.toLocaleString()
  )

  console.log(
    'Suspicious Transactions:',
    suspiciousTransactions.toLocaleString()
  )

  console.log(
    'Balance Mismatch:',
    balanceMismatchTransactions.toLocaleString()
  )

  console.log('\nSaved to:')
  console.log(outputPath)
}

generateSummary()