const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config()

const authRoutes = require('./routes/auth')
const dashboardRoutes = require('./routes/dashboard')
const transactionRoutes = require('./routes/transactions')
const anomalyRoutes = require('./routes/anomalies')

const app = express()
const PORT = process.env.PORT || 5000

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('Missing MONGO_URI or JWT_SECRET in .env')
  process.exit(1)
}

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}))

app.use(express.json({ limit: '1mb' }))

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Behaviour Analysis Backend is running.',
    status: 'OK'
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/anomalies', anomalyRoutes)

// Serve Python-generated HTML/JSON output files
app.use(
  '/analytics',
  express.static(path.join(__dirname, 'data', 'outputs'))
)   

// Handle unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    message: `API route not found: ${req.method} ${req.originalUrl}`
  })
})

// General error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message)

  if (res.headersSent) {
    return next(err)
  }

  res.status(500).json({
    message: 'An unexpected server error occurred.'
  })
})

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected successfully')

    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Startup error:', error.message)
    process.exit(1)
  }
}

startServer()