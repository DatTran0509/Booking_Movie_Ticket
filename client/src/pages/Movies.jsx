import React, { useState, useEffect } from 'react'
import { dummyShowsData } from '../assets/assets'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { Film, Calendar, Clock, Star, Filter, Search } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
const Movies = () => {
  const {shows} = useAppContext()
  const [isVisible, setIsVisible] = useState(false)
  const [animationDelay, setAnimationDelay] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return shows.length > 0 ? (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'> 
      {/* Enhanced Background Effects */}
      <div className='absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent'></div>
      <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse duration-[6000ms]'></div>
      
      {/* Floating Particles */}
      <div className='absolute top-20 left-10 w-2 h-2 bg-primary/60 rounded-full animate-bounce duration-[3000ms]'></div>
      <div className='absolute top-40 right-20 w-1 h-1 bg-white/40 rounded-full animate-ping duration-[4000ms] delay-1000'></div>
      <div className='absolute bottom-60 left-1/4 w-1.5 h-1.5 bg-primary/50 rounded-full animate-pulse duration-[5000ms] delay-2000'></div>
      <div className='absolute top-60 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-bounce delay-500'></div>

      {/* Header Section with Animation */}
      <div className={`relative z-10 mb-12 transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
      }`}>
        {/* Title with Glow Effect */}
        <div className='relative mb-6'>
          <div className='absolute inset-0 bg-white/20 blur-xl rounded-lg animate-pulse duration-[8000ms]'></div>
          <div className='absolute inset-0 bg-primary/20 blur-2xl rounded-lg animate-pulse duration-[8000ms] delay-1000'></div>
          
          <h1 className='relative text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent mb-4 leading-tight'>
            Now Showing
          </h1>
          
          {/* Animated Underline */}
          <div className='flex items-center gap-4 mb-4'>
            <div className='w-20 h-1 bg-gradient-to-r from-primary to-primary-dull rounded-full animate-pulse duration-[3000ms]'></div>
            <Film className='w-6 h-6 text-primary animate-pulse duration-[2000ms]' />
            <div className='w-32 h-1 bg-gradient-to-r from-primary-dull to-transparent rounded-full animate-pulse duration-[3000ms] delay-500'></div>
          </div>
          
          {/* Subtitle */}
          <p className='text-gray-300 text-lg md:text-xl leading-relaxed max-w-2xl'>
            Discover the latest blockbusters and cinematic masterpieces in theaters now
          </p>
        </div>

        {/* Stats Bar */}
        <div className={`flex flex-wrap items-center gap-6 mb-8 transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
        }`}>
          <div className='flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300'>
            <Calendar className='w-4 h-4 text-primary' />
            <span className='text-white text-sm font-medium'>Latest Releases</span>
          </div>
          <div className='flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300'>
            <Star className='w-4 h-4 text-yellow-400' />
            <span className='text-white text-sm font-medium'>{dummyShowsData.length} Movies</span>
          </div>
          <div className='flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 hover:bg-white/15 hover:scale-105 transition-all duration-300'>
            <Clock className='w-4 h-4 text-green-400' />
            <span className='text-white text-sm font-medium'>All Showtimes</span>
          </div>
        </div>
      </div>

      {/* Enhanced Blur Circles */}
      <BlurCircle top='150px' left='0px' />
      <BlurCircle bottom='50px' right='50px' />
      
      {/* Additional Decorative Elements */}
      <div className='absolute top-32 right-20 w-20 h-20 border border-primary/20 rounded-full animate-spin duration-[20000ms]'></div>
      <div className='absolute bottom-40 left-16 w-16 h-16 border-2 border-white/10 rounded-full animate-pulse duration-[6000ms]'></div>
      <div className='absolute top-1/2 left-10 w-12 h-12 border border-primary/30 rounded-full animate-bounce duration-[4000ms]'></div>

      {/* Movies Grid with Fixed 4-Column Layout */}
      <div className={`relative z-10 transition-all duration-1000 delay-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}>
        {/* CSS Grid Layout - 4 columns per row */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 justify-items-center'>
          {shows.map((movie, index) => (
            <div
              key={movie._id}
              className={`w-full max-w-[280px] transition-all duration-700 ${
                isVisible 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-20 opacity-0'
              }`}
              style={{
                transitionDelay: `${500 + index * 100}ms`
              }}
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Elements */}
      <div className='fixed bottom-8 right-8 z-20'>
        <div className='flex flex-col gap-4'>
          {/* Scroll to Top Button */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className='group w-12 h-12 bg-primary/80 hover:bg-primary rounded-full backdrop-blur-sm border border-primary/30 hover:border-primary/60 transition-all duration-300 hover:scale-110 flex items-center justify-center shadow-lg shadow-primary/20'
          >
            <Film className='w-5 h-5 text-white group-hover:scale-125 transition-transform duration-300' />
          </button>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className='absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none'></div>
    </div>
  ) : (
    /* Enhanced Empty State */
    <div className='relative flex flex-col items-center justify-center min-h-[60vh] px-6 md:px-16 lg:px-40 xl:px-44'>
      {/* Background Effects for Empty State */}
      <div className='absolute inset-0 bg-gradient-to-br from-gray-900/50 via-transparent to-gray-900/50'></div>
      
      {/* Floating Particles for Empty State */}
      <div className='absolute top-20 left-20 w-2 h-2 bg-gray-500/40 rounded-full animate-pulse duration-[4000ms]'></div>
      <div className='absolute bottom-20 right-20 w-1 h-1 bg-gray-400/30 rounded-full animate-bounce delay-1000'></div>
      
      <BlurCircle top='50px' left='50px' />
      <BlurCircle bottom='50px' right='50px' />
      
      {/* Empty State Content */}
      <div className={`relative z-10 text-center transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        {/* Icon */}
        <div className='relative mb-8'>
          <div className='absolute inset-0 bg-gray-500/20 blur-xl rounded-full animate-pulse duration-[6000ms]'></div>
          <div className='relative w-24 h-24 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center border-2 border-gray-700/50'>
            <Film className='w-12 h-12 text-gray-400 animate-pulse duration-[3000ms]' />
          </div>
        </div>
        
        {/* Title */}
        <h1 className='text-3xl md:text-4xl font-bold text-gray-300 mb-4'>
          No Movies Available
        </h1>
        
        {/* Description */}
        <p className='text-gray-500 text-lg max-w-md mx-auto mb-8 leading-relaxed'>
          We're currently updating our movie catalog. Please check back soon for the latest releases.
        </p>
        
        {/* Action Button */}
        <button className='group px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold rounded-full border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto shadow-lg'>
          <Search className='w-5 h-5 group-hover:scale-125 transition-transform duration-300' />
          <span>Browse Other Sections</span>
        </button>
      </div>
      
      {/* Decorative Elements for Empty State */}
      <div className='absolute top-1/4 left-10 w-16 h-16 border border-gray-700/30 rounded-full animate-spin duration-[25000ms]'></div>
      <div className='absolute bottom-1/4 right-10 w-12 h-12 border border-gray-600/20 rounded-full animate-pulse duration-[8000ms]'></div>
    </div>
  )
}

export default Movies
