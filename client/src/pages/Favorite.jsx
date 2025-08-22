import React, { useState, useEffect } from 'react'
import { dummyShowsData } from '../assets/assets'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { Heart, Star, Award, Trophy, Crown, Sparkles } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

const Favorite = () => {
  const {favoriteMovies, shows} = useAppContext()
  const [isVisible, setIsVisible] = useState(false)
  const [topRatedMovies, setTopRatedMovies] = useState([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Sắp xếp phim theo vote_average và lấy top 10
    const sortedMovies = [...shows]
      .sort((a, b) => {
        const voteA = parseFloat(a.vote_average) || 0
        const voteB = parseFloat(b.vote_average) || 0
        return voteB - voteA
      })
      .slice(0, 10)
    
    setTopRatedMovies(sortedMovies)
  }, [])

  return topRatedMovies.length > 0 ? (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'> 
      {/* Enhanced Background Effects */}
      <div className='absolute inset-0 bg-gradient-to-br from-transparent via-yellow-500/5 to-transparent'></div>
      <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent animate-pulse duration-[6000ms]'></div>
      
      {/* Floating Particles */}
      <div className='absolute top-20 left-10 w-2 h-2 bg-yellow-500/60 rounded-full animate-bounce duration-[3000ms]'></div>
      <div className='absolute top-40 right-20 w-1 h-1 bg-white/40 rounded-full animate-ping duration-[4000ms] delay-1000'></div>
      <div className='absolute bottom-60 left-1/4 w-1.5 h-1.5 bg-yellow-500/50 rounded-full animate-pulse duration-[5000ms] delay-2000'></div>
      <div className='absolute top-60 right-1/3 w-1 h-1 bg-white/30 rounded-full animate-bounce delay-500'></div>

      {/* Header Section with Animation */}
      <div className={`relative z-10 mb-12 transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
      }`}>
        {/* Title with Glow Effect */}
        <div className='relative mb-6'>
          <div className='absolute inset-0 bg-yellow-500/20 blur-xl rounded-lg animate-pulse duration-[8000ms]'></div>
          <div className='absolute inset-0 bg-yellow-500/10 blur-2xl rounded-lg animate-pulse duration-[8000ms] delay-1000'></div>
          
          <div className='flex items-center gap-4 mb-4'>
            <Crown className='w-8 h-8 md:w-10 md:h-10 text-yellow-500 animate-pulse duration-[2000ms]' />
            <h1 className='relative text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent leading-tight'>
              Top Rated Movies
            </h1>
            <Trophy className='w-8 h-8 md:w-10 md:h-10 text-yellow-500 animate-bounce duration-[3000ms]' />
          </div>
          
          {/* Animated Underline */}
          <div className='flex items-center gap-4 mb-4'>
            <div className='w-20 h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full animate-pulse duration-[3000ms]'></div>
            <Star className='w-6 h-6 text-yellow-500 animate-pulse duration-[2000ms]' />
            <div className='w-32 h-1 bg-gradient-to-r from-yellow-600 to-transparent rounded-full animate-pulse duration-[3000ms] delay-500'></div>
          </div>
          
          {/* Subtitle */}
          <p className='text-gray-300 text-lg md:text-xl leading-relaxed max-w-2xl'>
            ⭐ Discover the highest-rated cinematic masterpieces loved by audiences worldwide
          </p>
        </div>

        {/* Stats Bar */}
        <div className={`flex flex-wrap items-center gap-6 mb-8 transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
        }`}>
          <div className='flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-full backdrop-blur-sm border border-yellow-500/20 hover:bg-yellow-500/15 hover:scale-105 transition-all duration-300'>
            <Award className='w-4 h-4 text-yellow-500' />
            <span className='text-white text-sm font-medium'>Top Rated</span>
          </div>
          <div className='flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-full backdrop-blur-sm border border-yellow-500/20 hover:bg-yellow-500/15 hover:scale-105 transition-all duration-300'>
            <Star className='w-4 h-4 text-yellow-400' />
            <span className='text-white text-sm font-medium'>{topRatedMovies.length} Movies</span>
          </div>
          <div className='flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-full backdrop-blur-sm border border-yellow-500/20 hover:bg-yellow-500/15 hover:scale-105 transition-all duration-300'>
            <Heart className='w-4 h-4 text-red-400' />
            <span className='text-white text-sm font-medium'>Fan Favorites</span>
          </div>
          <div className='flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-full backdrop-blur-sm border border-yellow-500/20 hover:bg-yellow-500/15 hover:scale-105 transition-all duration-300'>
            <Sparkles className='w-4 h-4 text-purple-400' />
            <span className='text-white text-sm font-medium'>
              Highest: {topRatedMovies.length > 0 ? Math.max(...topRatedMovies.map(m => parseFloat(m.vote_average) || 0)).toFixed(1) : '0.0'}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Blur Circles */}
      <BlurCircle top='150px' left='0px' />
      <BlurCircle bottom='50px' right='50px' />
      
      {/* Additional Decorative Elements */}
      <div className='absolute top-32 right-20 w-20 h-20 border border-yellow-500/20 rounded-full animate-spin duration-[20000ms]'></div>
      <div className='absolute bottom-40 left-16 w-16 h-16 border-2 border-white/10 rounded-full animate-pulse duration-[6000ms]'></div>
      <div className='absolute top-1/2 left-10 w-12 h-12 border border-yellow-500/30 rounded-full animate-bounce duration-[4000ms]'></div>

      {/* Top Movies Grid with Rankings */}
      <div className={`relative z-10 transition-all duration-1000 delay-500 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}>
        {/* CSS Grid Layout - 4 columns per row */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 justify-items-center'>
          {topRatedMovies.map((movie, index) => (
            <div
              key={movie._id}
              className={`relative w-full max-w-[280px] transition-all duration-700 ${
                isVisible 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-20 opacity-0'
              }`}
              style={{
                transitionDelay: `${500 + index * 100}ms`
              }}
            >
              {/* Ranking Badge */}
              <div className='absolute -top-2 -left-2 z-20'>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 ${
                  index === 0 
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300' 
                    : index === 1 
                    ? 'bg-gradient-to-br from-gray-300 to-gray-500 border-gray-200'
                    : index === 2
                    ? 'bg-gradient-to-br from-amber-600 to-amber-800 border-amber-400'
                    : 'bg-gradient-to-br from-purple-500 to-purple-700 border-purple-400'
                }`}>
                  {index < 3 ? (
                    index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'
                  ) : (
                    index + 1
                  )}
                </div>
              </div>

              {/* Vote Average Badge */}
              <div className='absolute -top-2 -right-2 z-20'>
                <div className='bg-gradient-to-br from-yellow-500 to-yellow-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg border border-yellow-400'>
                  <Star className='w-3 h-3 fill-current' />
                  {parseFloat(movie.vote_average)?.toFixed(1) || 'N/A'}
                </div>
              </div>

              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className={`mt-16 text-center transition-all duration-1000 delay-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className='bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-yellow-500/10 rounded-2xl p-8 backdrop-blur-sm border border-yellow-500/20'>
            <h3 className='text-2xl font-bold text-yellow-400 mb-4 flex items-center justify-center gap-3'>
              <Trophy className='w-6 h-6' />
              Collection Highlights
              <Trophy className='w-6 h-6' />
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-white mb-2'>
                  {Math.max(...topRatedMovies.map(m => parseFloat(m.vote_average) || 0)).toFixed(1)}
                </div>
                <div className='text-yellow-400 text-sm'>Highest Rating</div>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold text-white mb-2'>
                  {(topRatedMovies.reduce((sum, m) => sum + (parseFloat(m.vote_average) || 0), 0) / topRatedMovies.length).toFixed(1)}
                </div>
                <div className='text-yellow-400 text-sm'>Average Rating</div>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold text-white mb-2'>
                  {topRatedMovies.filter(m => parseFloat(m.vote_average) >= 8.0).length}
                </div>
                <div className='text-yellow-400 text-sm'>8.0+ Rated</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Elements */}
      <div className='fixed bottom-8 right-8 z-20'>
        <div className='flex flex-col gap-4'>
          {/* Scroll to Top Button */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className='group w-12 h-12 bg-yellow-500/80 hover:bg-yellow-500 rounded-full backdrop-blur-sm border border-yellow-500/30 hover:border-yellow-500/60 transition-all duration-300 hover:scale-110 flex items-center justify-center shadow-lg shadow-yellow-500/20'
          >
            <Crown className='w-5 h-5 text-white group-hover:scale-125 transition-transform duration-300' />
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
            <Heart className='w-12 h-12 text-gray-400 animate-pulse duration-[3000ms]' />
          </div>
        </div>
        
        {/* Title */}
        <h1 className='text-3xl md:text-4xl font-bold text-gray-300 mb-4'>
          No Top Rated Movies
        </h1>
        
        {/* Description */}
        <p className='text-gray-500 text-lg max-w-md mx-auto mb-8 leading-relaxed'>
          We're currently updating our ratings database. Please check back soon for the top-rated movies.
        </p>
        
        {/* Action Button */}
        <button className='group px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold rounded-full border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto shadow-lg'>
          <Star className='w-5 h-5 group-hover:scale-125 transition-transform duration-300' />
          <span>Browse All Movies</span>
        </button>
      </div>
      
      {/* Decorative Elements for Empty State */}
      <div className='absolute top-1/4 left-10 w-16 h-16 border border-gray-700/30 rounded-full animate-spin duration-[25000ms]'></div>
      <div className='absolute bottom-1/4 right-10 w-12 h-12 border border-gray-600/20 rounded-full animate-pulse duration-[8000ms]'></div>
    </div>
  )
}

export default Favorite
