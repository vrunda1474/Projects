import React from 'react'

const StatCard = ({
  title,
  value,
  description
}) => {

  return (

    <div className="bg-white rounded-xl shadow p-6">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <h2 className="text-3xl font-bold text-gray-800 mt-2">
        {value}
      </h2>

      <p className="text-sm text-gray-400 mt-2">
        {description}
      </p>

    </div>

  )
}

export default StatCard