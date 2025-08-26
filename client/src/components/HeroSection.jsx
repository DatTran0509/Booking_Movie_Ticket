import React, { useState, useEffect } from 'react'
import { CalendarIcon, ClockIcon, PlayIcon, PlusIcon, Film, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import timeFormat from '../lib/timeFormat'

const HeroSection = () => {
  const { axios, getToken, user, image_base_url, shows } = useAppContext()
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0)
  const [heroMovies, setHeroMovies] = useState([])
  const [titleAnimationKey, setTitleAnimationKey] = useState(0)
  const navigate = useNavigate()

  // ✅ Extract unique movies from shows (max 4)
  const extractHeroMovies = () => {
    if (!shows || shows.length === 0) {
      setHeroMovies([])
      return
    }

    // ✅ Shows are already movies, get unique movies by ID
    const uniqueMoviesMap = new Map()

    shows.forEach(movie => {

      if (movie && movie._id && !uniqueMoviesMap.has(movie._id)) {
        uniqueMoviesMap.set(movie._id, movie)
      }
    })

    // Convert to array and shuffle
    const uniqueMovies = Array.from(uniqueMoviesMap.values())
    const shuffled = uniqueMovies.sort(() => 0.5 - Math.random())

    // Take max 4 movies, or all if less than 4
    const selectedMovies = shuffled.slice(0, Math.min(4, shuffled.length))

    setHeroMovies(selectedMovies)
  }
  

  useEffect(() => {
    // Extract movies when shows change
    extractHeroMovies()

    // Initial animation
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [shows]) // ✅ Depend on shows instead of empty array

  useEffect(() => {
    if (heroMovies.length === 0) return

    // Auto-rotate movies every 5 seconds
    const rotateInterval = setInterval(() => {
      setCurrentMovieIndex(prev => (prev + 1) % heroMovies.length)
      setTitleAnimationKey(prev => prev + 1)
    }, 5000)

    return () => clearInterval(rotateInterval)
  }, [heroMovies.length])

  // Get current movie
  const currentMovie = heroMovies[currentMovieIndex]

  // ✅ Show loading while waiting for shows or if no movies
  if (!shows || shows.length === 0 || !currentMovie) {
    return (
      <div className='relative flex flex-col items-start justify-center gap-6 px-6 md:px-16 lg:px-36 h-screen text-white overflow-hidden'>
        {/* ✅ Fallback background */}
        <div className='absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black'></div>

        <div className='relative z-10 flex flex-col items-center justify-center w-full h-full'>
          <div className='animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4'></div>
          <p className='text-gray-400 text-lg'>
            {!shows || shows.length === 0 ? 'Loading movies...' : 'No movies available'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* CSS styles */}
      <style>{`
        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes zoomIn {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideInLeft {
          animation: slideInLeft 1s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 1s ease-out 0.3s both;
        }

        .animate-zoomIn {
          animation: zoomIn 1s ease-out 0.6s both;
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>

      <div className='relative flex flex-col items-start justify-center gap-6 px-6 md:px-16 lg:px-36 h-screen text-white overflow-hidden'>
        {/* ✅ Dynamic Background with Current Movie Backdrop */}
        <div
          className='absolute inset-0 bg-cover bg-center transform scale-110 transition-all duration-1000 brightness-50'
          style={{
            backgroundImage: `url(${image_base_url}${currentMovie.backdrop_path})`,
          }}
        ></div>

        {/* Enhanced Background Overlays */}
        <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/20 animate-pulse duration-[8000ms]'></div>
        <div className='absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/70'></div>
        <div className='absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-transparent animate-pulse duration-[6000ms]'></div>

        {/* Enhanced Floating Particles */}
        <div className='absolute top-20 left-20 w-3 h-3 bg-primary/90 rounded-full animate-bounce duration-[4000ms]'></div>
        <div className='absolute top-40 right-32 w-2 h-2 bg-white/70 rounded-full animate-ping duration-[3000ms] delay-1000'></div>
        <div className='absolute bottom-40 left-16 w-2 h-2 bg-primary/90 rounded-full animate-pulse duration-[5000ms] delay-2000'></div>
        <div className='absolute top-60 right-20 w-1 h-1 bg-white/60 rounded-full animate-bounce delay-500'></div>
        <div className='absolute top-80 left-1/3 w-1.5 h-1.5 bg-primary/80 rounded-full animate-ping duration-[4000ms] delay-1500'></div>
        <div className='absolute bottom-60 right-1/4 w-2 h-2 bg-white/50 rounded-full animate-pulse duration-[6000ms] delay-3000'></div>

        {/* Content */}
        <div className='relative z-10 max-w-3xl'>
          

          {/* ✅ Dynamic Movie Title with Animation */}
          <h1 
            key={`title-${titleAnimationKey}`}
            className='text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-6 animate-fadeIn'
          >
            {currentMovie.title.split(' ').map((word, index) => (
              <span 
                key={`${word}-${index}-${titleAnimationKey}-${currentMovieIndex}`} // ✅ More unique key
                className={`inline-block mr-3 mb-2 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent ${
                  index === 0 ? 'animate-slideInLeft' : 
                  index === 1 ? 'animate-slideInRight' : 
                  'animate-zoomIn'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {word}
              </span>
            ))}
          </h1>

          {/* ✅ Dynamic Movie Genres */}
          <div className={`flex flex-wrap items-center gap-4 md:gap-6 mb-6 text-sm md:text-base transition-all duration-1000 delay-900 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}>
            <div className='flex items-center gap-2'>
              {currentMovie.genre_ids?.slice(0, 3).map((genreId, index) => {
                // Basic genre mapping
                const genreMap = {
                  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
                  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
                  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
                  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
                  53: 'Thriller', 10752: 'War', 37: 'Western'
                }
                
                return (
                  <span 
                    key={`${genreId}-${index}`} // ✅ Add unique key with index
                    className='px-3 py-1 bg-white/15 rounded-full backdrop-blur-sm border border-white/30 hover:bg-white/25 hover:scale-105 hover:border-primary/40 transition-all duration-300 cursor-pointer'
                  >
                    {genreMap[genreId] || 'Drama'}
                  </span>
                )
              })}
            </div>
          </div>

          {/* ✅ Dynamic Movie Info */}
          <div className={`flex items-center gap-6 mb-6 text-white/90 transition-all duration-1000 delay-1100 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}>
            <div className='flex items-center gap-2 hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer'>
              <CalendarIcon className='w-5 h-5 text-primary animate-pulse duration-[3000ms]' />
              <span className='font-medium'>
                {currentMovie.release_date ? new Date(currentMovie.release_date).getFullYear() : '2024'}
              </span>
            </div>

            <div className='flex items-center gap-2 hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer'>
              <ClockIcon className='w-5 h-5 text-primary animate-pulse duration-[3000ms]' />
              <span className='font-medium'>
                {currentMovie.runtime ? timeFormat(currentMovie.runtime) : '2h 0m'}
              </span>
            </div>

            <div className='flex items-center gap-2 hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer'>
              <Star className='w-5 h-5 text-yellow-400 fill-current animate-pulse duration-[3000ms]' />
              <span className='font-medium'>
                {currentMovie.vote_average?.toFixed(1) || '8.5'}
              </span>
            </div>
          </div>

          {/* ✅ Dynamic Movie Description */}
          <p className={`text-white/95 text-base md:text-lg leading-relaxed mb-8 max-w-2xl transition-all duration-1000 delay-1300 hover:text-white ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
            }`}>
            {currentMovie.overview || 'An epic adventure that will take you on an unforgettable journey through spectacular worlds and extraordinary characters.'}
          </p>

          {/* Action Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-1500 ${isLoaded ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-10 scale-95 opacity-0'
            }`}>
            <button
              onClick={() => navigate(`/movies/${currentMovie._id || currentMovie.id}`)}
              className='group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary-dull hover:from-primary-dull hover:to-primary text-white font-semibold rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/60 hover:scale-105 active:scale-95 transition-all duration-300 border border-primary/30 hover:border-primary/60 relative overflow-hidden'
            >
              <Film className='w-5 h-5 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300' />
              <span className='relative z-10'>Book Now</span>
              <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700'></div>
            </button>

            <button
              onClick={() => navigate(`/movies/${currentMovie._id || currentMovie.id}`)} // ✅ Fix ID reference
              className='group flex items-center gap-3 px-8 py-4 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-full border border-white/40 hover:border-primary/40 backdrop-blur-sm hover:scale-105 transition-all duration-300 relative overflow-hidden'
            >
              <PlayIcon className='w-5 h-5 group-hover:scale-125 transition-transform duration-500' />
              <span>Watch Trailer</span>
              <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700'></div>
            </button>
          </div>

          {/* ✅ Movie Navigation Dots */}
          <div className='flex items-center gap-3 mt-8'>
            {heroMovies.map((movie, index) => (
              <button
                key={movie._id || movie.id || `movie-${index}`} // ✅ Fix key prop
                onClick={() => {
                  setCurrentMovieIndex(index)
                  setTitleAnimationKey(prev => prev + 1)
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentMovieIndex
                    ? 'bg-primary scale-125 shadow-lg shadow-primary/50'
                    : 'bg-white/30 hover:bg-white/50 hover:scale-110'
                  }`}
                title={movie.title} // ✅ Show movie title on hover
              />
            ))}
          </div>
        </div>

        {/* Enhanced Decorative Elements */}
        <div className='absolute bottom-10 right-10 w-20 h-20 border-2 border-primary/30 rounded-full animate-spin duration-[12000ms]'></div>
        <div className='absolute top-32 right-40 w-16 h-16 border border-white/20 rounded-full animate-bounce duration-[4000ms]'></div>
        <div className='absolute bottom-20 left-1/4 w-12 h-12 border border-primary/20 rounded-full animate-ping duration-[5000ms]'></div>
        <div className='absolute top-1/4 left-10 w-8 h-8 border border-white/10 rounded-full animate-pulse duration-[8000ms]'></div>

        {/* Moving Light Effects */}
        <div className='absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse duration-[5000ms]'></div>
        <div className='absolute bottom-0 right-0 w-2 h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-pulse duration-[6000ms]'></div>
      </div>
    </>
  )
}

export default HeroSection