import React from 'react'

const Navbar = () => {

  const user = JSON.parse(
    localStorage.getItem('user')
  )


  return (

    <header className="bg-white border-b px-8 py-5 flex justify-between items-center">

      <div>

        <h2 className="text-xl font-semibold text-gray-800">
          Behaviour Analysis
        </h2>

        <p className="text-sm text-gray-500">
          Coordinated Behaviour Detection System
        </p>

      </div>


      <div className="text-right">

        <p className="font-semibold text-gray-800">
          {user?.name || 'User'}
        </p>

        <p className="text-sm text-gray-500">
          {user?.email || ''}
        </p>

      </div>

    </header>

  )
}

export default Navbar