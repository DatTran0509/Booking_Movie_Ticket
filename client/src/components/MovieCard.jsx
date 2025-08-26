import React, { useState } from 'react'
import { Star, Calendar, Clock, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import timeFormat from '../lib/timeFormat'

const MovieCard = ({ movie }) => {
  const { image_base_url } = useAppContext()
  const navigate = useNavigate()
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleCardClick = () => {
    navigate(`/movies/${movie._id}`)
    window.scrollTo(0, 0)
  }

  return (
    <div className='group relative bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/30 hover:border-primary/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 cursor-pointer'>
      <div onClick={handleCardClick}>
        {/* Movie Poster */}
        <div className='relative aspect-[2/3] overflow-hidden'>
          {!imageLoaded && (
            <div className='absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center'>
              <div className='w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin'></div>
            </div>
          )}
          
          <img
            src={`${image_base_url}${movie.poster_path}`}
            alt={movie.title}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          
          {/* Overlay Gradient */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
          
          {/* ✅ Fixed Rating Badge - Better positioning for all screen sizes */}
          <div className='absolute top-3 right-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-sm px-2.5 py-1.5 rounded-full border border-yellow-500/30'>
            <Star className='w-3.5 h-3.5 fill-yellow-500 text-yellow-500' />
            <span className='text-white text-xs font-bold leading-none'>
              {movie.vote_average ? movie.vote_average.toFixed(1) : '8.5'}
            </span>
          </div>
          
          {/* Play Button Overlay */}
          <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-75 group-hover:scale-100'>
            <div className='w-16 h-16 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shadow-2xl shadow-primary/50'>
              <Eye className='w-7 h-7 text-white ml-1' />
            </div>
          </div>
        </div>

        {/* Movie Info */}
        <div className='p-4 space-y-3'>
          {/* ✅ Title with better text handling for large screens */}
          <div>
            <h3 className='text-white font-bold text-base lg:text-lg xl:text-xl leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2'>
              {movie.title}
            </h3>
          </div>

          {/* ✅ Movie Details - Better responsive layout */}
          <div className='space-y-2'>
            {/* Year and Runtime */}
            <div className='flex items-center justify-between text-xs lg:text-sm'>
              <div className='flex items-center gap-1.5 text-gray-400'>
                <Calendar className='w-3.5 h-3.5 flex-shrink-0' />
                <span className='font-medium'>
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : '2024'}
                </span>
              </div>
              
              <div className='flex items-center gap-1.5 text-gray-400'>
                <Clock className='w-3.5 h-3.5 flex-shrink-0' />
                <span className='font-medium'>
                  {movie.runtime ? timeFormat(movie.runtime) : '2h 0m'}
                </span>
              </div>
            </div>

            {/* ✅ Genres - Better responsive handling */}
            <div className='flex flex-wrap gap-1'>
              {movie.genre_ids?.slice(0, 2).map((genreId, index) => {
                const genreMap = {
                  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
                  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
                  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
                  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
                  53: 'Thriller', 10752: 'War', 37: 'Western'
                }
                
                return (
                  <span 
                    key={genreId}
                    className='px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md border border-primary/20 truncate'
                  >
                    {genreMap[genreId] || 'Drama'}
                  </span>
                )
              })}
            </div>
          </div>

          {/* ✅ Buy Tickets Button - Better responsive sizing */}
          <button 
            onClick={(e) => {
              e.stopPropagation()
              handleCardClick()
            }}
            className='w-full bg-gradient-to-r from-primary to-primary-dull hover:from-primary-dull hover:to-primary text-white font-semibold py-2.5 lg:py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/30 text-sm lg:text-base'
          >
            Buy Tickets
          </button>
        </div>

        {/* ✅ Enhanced Glow Effect */}
        <div className='absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'></div>
      </div>
    </div>
  )
}

export default MovieCard
