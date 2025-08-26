import React, { useState } from 'react'
import { Star, Calendar, Clock, Eye, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import timeFormat from '../lib/timeFormat'

const MovieCard = ({ movie }) => {
  const { image_base_url } = useAppContext()
  const navigate = useNavigate()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleCardClick = () => {
    navigate(`/movies/${movie._id}`)
    window.scrollTo(0, 0)
  }

  const getRating = () => {
    return movie.vote_average ? movie.vote_average.toFixed(1) : '8.0'
  }

  const getYear = () => {
    return movie.release_date ?  movie.release_date : new Date().getFullYear()
  }
  const getRuntime = () => {
    return movie.runtime ? timeFormat(movie.runtime) : '2h 0m'
  }

  const getGenres = () => {
    const genreMap = {
      28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
      80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
      14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
      9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
      53: 'Thriller', 10752: 'War', 37: 'Western'
    }
    
    return movie.genres?.slice(0, 2).map(id => genreMap[id] || 'Drama') || ['Drama']
  }

  return (
    <div className='group relative bg-gray-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/40 hover:border-primary/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 cursor-pointer h-full flex flex-col'>
      {/* ✅ Consistent Poster Container */}
      <div className='relative aspect-[2/3] overflow-hidden flex-shrink-0' onClick={handleCardClick}>
        {/* Loading State */}
        {!imageLoaded && !imageError && (
          <div className='absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center'>
            <div className='w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin'></div>
          </div>
        )}
        
        {/* Error State */}
        {imageError && (
          <div className='absolute inset-0 bg-gray-800 flex flex-col items-center justify-center text-gray-400'>
            <div className='w-16 h-16 border-2 border-gray-600 rounded-lg flex items-center justify-center mb-2'>
              <Eye className='w-6 h-6' />
            </div>
            <span className='text-sm'>No Image</span>
          </div>
        )}
        
        {/* Movie Poster */}
        {!imageError && (
          <img
            src={`${image_base_url}${movie.poster_path}`}
            alt={movie.title}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true)
              setImageLoaded(true)
            }}
          />
        )}
        
        {/* ✅ Enhanced Overlay Gradient */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
        
        {/* ✅ Fixed Rating Badge Position */}
        <div className='absolute top-3 right-3 flex items-center gap-1.5 bg-black/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full border border-yellow-500/40 shadow-lg'>
          <Star className='w-3.5 h-3.5 fill-yellow-500 text-yellow-500 flex-shrink-0' />
          <span className='text-white text-xs font-bold leading-none'>
            {getRating()}
          </span>
        </div>
        
        {/* ✅ Enhanced Play Button */}
        <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-75 group-hover:scale-100'>
          <div className='w-16 h-16 bg-primary/95 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40 shadow-2xl shadow-primary/60'>
            <Play className='w-7 h-7 text-white ml-1 fill-white' />
          </div>
        </div>
      </div>

      {/* ✅ Consistent Content Container */}
      <div className='p-4 flex-1 flex flex-col justify-between space-y-3'>
        {/* Movie Title */}
        <div className='flex-shrink-0'>
          <h3 className='text-white font-bold text-base lg:text-lg leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2 min-h-[2.5rem] flex items-start'>
            {movie.title}
          </h3>
        </div>

        {/* ✅ Movie Details Grid */}
        <div className='space-y-3 flex-1'>
          {/* Year and Runtime */}
          <div className='flex items-center justify-between text-xs text-gray-400'>
            <div className='flex items-center gap-1.5'>
              <Calendar className='w-3.5 h-3.5 flex-shrink-0' />
              <span className='font-medium'>{getYear()}</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <Clock className='w-3.5 h-3.5 flex-shrink-0' />
              <span className='font-medium'>{getRuntime()}</span>
            </div>
          </div>

          {/* ✅ Genres with consistent spacing */}
          <div className='flex flex-wrap gap-1.5 min-h-[1.75rem]'>
            {getGenres().map((genre, index) => (
              <span 
                key={index}
                className='px-2 py-1 bg-primary/15 text-primary text-xs font-medium rounded-md border border-primary/25 truncate flex-shrink-0'
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        {/* ✅ Buy Tickets Button - Always at bottom */}
        <div className='flex-shrink-0 pt-2'>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              handleCardClick()
            }}
            className='w-full bg-gradient-to-r from-primary to-primary-dull hover:from-primary-dull hover:to-primary text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30 text-sm relative overflow-hidden group/btn'
          >
            <span className='relative z-10'>Buy Tickets</span>
            <div className='absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-500'></div>
          </button>
        </div>
      </div>

      {/* ✅ Enhanced Card Glow Effect */}
      <div className='absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'></div>
    </div>
  )
}

export default MovieCard