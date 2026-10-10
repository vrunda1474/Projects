const API_URL = 'http://localhost:5000'

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Login failed')
  }

  return data
}

export const signupUser = async (name, email, password) => {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      email,
      password
    })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Signup failed')
  }

  return data
}

export const getDashboardSummary = async () => {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Authentication token not found')
  }

  const response = await fetch(
    `${API_URL}/api/dashboard/summary`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  const contentType = response.headers.get('content-type')

  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text()

    console.error('Unexpected server response:', text)

    throw new Error(
      'Server returned an invalid response.'
    )
  }

  const data = await response.json()

  console.log('Dashboard API response:', data)

  if (!response.ok) {
    throw new Error(
      data.message || 'Unable to load dashboard'
    )
  }

  return data
}

export const getAnomalies = async () => {

  const token = localStorage.getItem('token')

  const response = await fetch(
    `${API_URL}/api/anomalies`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Unable to load anomalies'
    )
  }

  return data
}


export const getTransactions = async () => {

  const token = localStorage.getItem('token')

  const response = await fetch(
    `${API_URL}/api/transactions`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Unable to load transactions'
    )
  }

  return data
}