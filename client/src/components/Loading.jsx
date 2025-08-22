import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const Loading = () => {
  const {nextUrl} = useParams()
  const navigate = useNavigate()

  useEffect(() => {
   if(nextUrl){
    setTimeout(() =>{navigate('/'+nextUrl)}, 8000)
   }
  }
  , [nextUrl, navigate])
  return (
    /* Loading State */
    <div className='min-h-screen bg-black flex items-center justify-center'>
      <div className='text-center'>
        <div className='w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
        <p className='text-white text-lg'>Loading...</p>
      </div>
    </div>
  )
}

export default Loading
