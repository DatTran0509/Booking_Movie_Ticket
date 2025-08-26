import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BlurCircle from '../components/BlurCircle'
import MovieCard from '../components/MovieCard'
import TrailerPlayer from '../components/TrailerPlayer' // ✅ Import TrailerPlayer
import { Heart, Play, Star, Clock, Calendar, Tag, ChevronRight } from 'lucide-react'
import timeFormat from '../lib/timeFormat'
import DateSlect from '../components/DateSlect'
import Loading from '../components/Loading'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MovieDetails = () => {
  const { shows, axios, getToken, user, image_base_url, fetchFavoriteMovies, favoriteMovies } = useAppContext()
  const { id } = useParams()
  const [show, setShow] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  // ✅ Add trailer player state
  const [showTrailerPlayer, setShowTrailerPlayer] = useState(false)
  const navigate = useNavigate()

  const isFavorited = favoriteMovies.find(movie => movie._id === id)

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setShow(data)
        // console.log('🎬 Movie data:', data.movie) // Debug log
        // console.log('🎬 Trailers:', data.movie?.trailers) // Debug log
      }
      else {
        console.log(data.message)
      }
    } catch (error) {
      console.error('Error fetching show:', error)
    }
  }

  const handleFavorite = async () => {
    try {
      if (!user) return toast.error('Please login to add to favorites')

      const { data } = await axios.post('/api/user/update-favorite', { movieId: id }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        await fetchFavoriteMovies()
        toast.success(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to update favorites')
    }
  }

  const handleBuyTickets = () => {
    document.getElementById('date-select')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  // ✅ Handle watch trailer
  const handleWatchTrailer = () => {
    if (show?.movie?.trailers && show.movie.trailers.length > 0) {
      setShowTrailerPlayer(true)
    } else {
      toast.error('No trailers available for this movie')
    }
  }

  useEffect(() => {
    getShow()
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 200)
    return () => clearTimeout(timer)
  }, [id])

  return show ? (
    <div className='relative min-h-screen bg-black overflow-hidden'>
      {/* Background Image with Overlay */}
      <div className='absolute inset-0'>
        <img
          src={image_base_url + show.movie.poster_path}
          alt={show.movie.title}
          className='w-full h-full object-cover opacity-30' // ✅ Even brighter
        />
        <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent'></div> {/* ✅ Less overlay */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30'></div> {/* ✅ Less overlay */}
      </div>

      {/* Decorative Elements */}
      <BlurCircle top='-100px' left='-100px' />
      <BlurCircle bottom='-150px' right='-150px' />

      {/* Floating Particles */}
      <div className='absolute top-20 right-20 w-2 h-2 bg-primary/60 rounded-full animate-bounce duration-[3000ms]'></div>
      <div className='absolute bottom-40 left-20 w-1 h-1 bg-white/40 rounded-full animate-ping duration-[4000ms] delay-1000'></div>
      <div className='absolute top-1/2 right-10 w-1.5 h-1.5 bg-primary/50 rounded-full animate-pulse duration-[5000ms] delay-2000'></div>

      {/* Main Content Container */}
      <div className='relative z-10 px-6 md:px-12 lg:px-16 xl:px-20'>

        {/* Hero Section */}
        <div className='flex flex-col lg:flex-row items-start gap-8 pt-20 pb-16'>
          {/* Movie Poster */}
          <div className={`flex-shrink-0 transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
            }`}>
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500'></div>
              <div className='relative overflow-hidden rounded-2xl border-2 border-white/10 group-hover:border-primary/30 transition-all duration-500 hover:scale-105 transform'>
                <img
                  src={image_base_url + show.movie.poster_path}
                  alt={show.movie.title}
                  className='w-full max-w-[350px] lg:max-w-[400px] h-auto object-cover'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
              </div>
            </div>
          </div>

          {/* Movie Information */}
          <div className='flex-1 space-y-6'>
            {/* Language Tag */}
            <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
              }`}>
              <span className='inline-flex items-center px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full border border-primary/30 backdrop-blur-sm'>
                {show.movie.original_language?.toUpperCase() || 'ENGLISH'}
              </span>
            </div>

            {/* Movie Title */}
            <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
              }`}>
              <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4'>
                {show.movie.title}
              </h1>
            </div>

            {/* Rating */}
            <div className={`transition-all duration-1000 delay-700 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
              }`}>
              <div className='flex items-center gap-2 mb-6'>
                <div className='flex items-center gap-1 px-3 py-1 bg-yellow-500/20 rounded-full border border-yellow-500/30'>
                  <Star className='w-4 h-4 text-yellow-500 fill-current' />
                  <span className='text-yellow-500 font-bold text-sm'>
                    {show.movie.vote_average.toFixed(1)}
                  </span>
                </div>
                <span className='text-gray-400 text-sm'>IMDb Rating</span>
              </div>
            </div>

            {/* Overview */}
            <div className={`transition-all duration-1000 delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
              <p className='text-gray-300 text-lg leading-relaxed max-w-3xl mb-6'>
                {show.movie.overview}
              </p>
            </div>

            {/* Movie Details */}
            <div className={`transition-all duration-1000 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
              <div className='flex flex-wrap items-center gap-4 text-gray-400 mb-8'>
                <div className='flex items-center gap-2'>
                  <Clock className='w-4 h-4 text-primary' />
                  <span>{timeFormat(show.movie.runtime)}</span>
                </div>
                <div className='w-1 h-1 bg-gray-600 rounded-full'></div>
                <div className='flex items-center gap-2'>
                  <Calendar className='w-4 h-4 text-primary' />
                  <span>{new Date(show.movie.release_date).getFullYear()}</span>
                </div>
                <div className='w-1 h-1 bg-gray-600 rounded-full'></div>
                <div className='flex items-center gap-2'>
                  <Tag className='w-4 h-4 text-primary' />
                  <span>{show.movie.genres.slice(0, 2).map(genre => genre.name).join(", ")}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`transition-all duration-1000 delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
              <div className='flex flex-wrap items-center gap-4'>
                {/* ✅ Updated Watch Trailer Button */}
                <button
                  onClick={handleWatchTrailer}
                  className={`group flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${show?.movie?.trailers && show.movie.trailers.length > 0
                    ? 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-primary/40 cursor-pointer'
                    : 'bg-gray-600/20 border-gray-600/30 cursor-not-allowed opacity-60'
                    }`}
                  disabled={!show?.movie?.trailers || show.movie.trailers.length === 0}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${show?.movie?.trailers && show.movie.trailers.length > 0
                    ? 'bg-white/20 group-hover:bg-primary/30'
                    : 'bg-gray-600/30'
                    }`}>
                    <Play className='w-5 h-5 text-white ml-0.5' />
                  </div>
                  <span className='text-white font-medium'>
                    {show?.movie?.trailers && show.movie.trailers.length > 0
                      ? `Watch Trailer${show.movie.trailers.length > 1 ? 's' : ''} (${show.movie.trailers.length})`
                      : 'No Trailers Available'
                    }
                  </span>
                </button>

                {/* Buy Tickets Button */}
                <button
                  onClick={handleBuyTickets}
                  className='group px-8 py-3 bg-gradient-to-r from-primary to-primary-dull hover:from-primary-dull hover:to-primary rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/20 hover:shadow-primary/40'
                >
                  Buy Tickets
                </button>

                {/* Like Button */}
                <button
                  onClick={handleFavorite}
                  className={`group w-12 h-12 rounded-full backdrop-blur-sm border transition-all duration-300 hover:scale-110 flex items-center justify-center ${isFavorited
                    ? 'bg-red-500/20 border-red-500/40'
                    : 'bg-white/10 hover:bg-white/20 border-white/20 hover:border-red-500/40'
                    }`}
                >
                  <Heart className={`w-5 h-5 transition-all duration-300 ${isFavorited
                    ? 'text-red-500 fill-red-500 scale-110'
                    : 'text-white group-hover:text-red-500 group-hover:scale-110'
                    }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cast Section */}
        <div className={`py-16 transition-all duration-1000 delay-1200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
          }`}>
          <div className='flex items-center gap-3 mb-8'>
            <div className='w-1 h-8 bg-primary rounded-full'></div>
            <h2 className='text-2xl font-bold text-white'>Your Favorite Cast</h2>
          </div>

          <div className='overflow-x-auto scrollbar-hide'>
            <div className='flex items-center gap-6 pb-4' style={{ width: 'max-content' }}>
              {show.movie.casts.slice(0).map((cast, index) => (
                <div
                  key={index}
                  className='flex flex-col items-center gap-3 text-center group cursor-pointer min-w-[100px]'
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className='relative'>
                    <div className='absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                    <img
                      src={image_base_url + cast.profile_path}
                      alt={cast.name}
                      className='relative w-20 h-20 rounded-full object-cover border-2 border-white/10 group-hover:border-primary/30 transition-all duration-300 group-hover:scale-105'
                    />
                  </div>

                  {/* ✅ Enhanced Cast Info */}
                  <div className='space-y-1'>
                    <p className='text-white text-sm font-medium group-hover:text-primary transition-colors duration-300 max-w-[100px] truncate'>
                      {cast.name}
                    </p>
                    {/* ✅ Add character name */}
                    <p className='text-gray-400 text-xs font-medium max-w-[100px] truncate'>
                      {cast.character || 'Unknown Role'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Date Selection Section */}
        <div className={`pb-16 transition-all duration-1000 delay-1400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
          }`}>
          <DateSlect dateTime={show.dateTime} id={id} />
        </div>

        {/* You May Also Like Section */}
        <div className={`py-16 transition-all duration-1000 delay-1600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
          }`}>
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center gap-3'>
              <div className='w-1 h-8 bg-primary rounded-full'></div>
              <h2 className='text-2xl font-bold text-white'>You May Also Like</h2>
            </div>
            <button
              onClick={() => navigate('/movies')}
              className='group flex items-center gap-2 px-4 py-2 text-primary hover:text-primary-dull transition-colors duration-300'
            >
              <span className='text-sm font-medium'>View All</span>
              <ChevronRight className='w-4 h-4 group-hover:translate-x-1 transition-transform duration-300' />
            </button>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {shows.slice(0, 4).map((movie, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ${isVisible
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-20 opacity-0'
                  }`}
                style={{
                  transitionDelay: `${1800 + index * 100}ms`
                }}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>

          <div className='flex justify-center mt-12'>
            <button
              onClick={() => {
                navigate('/movies')
                window.scrollTo(0, 0)
              }}
              className='group px-8 py-3 bg-gradient-to-r from-primary to-primary-dull hover:from-primary-dull hover:to-primary text-white font-semibold rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/60 hover:scale-105 active:scale-95 transition-all duration-300 border border-primary/30 hover:border-primary/60 relative overflow-hidden'
            >
              <span className='relative z-10'>Show More</span>
              <div className='absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500'></div>
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Circles */}
      <div className='absolute top-1/4 right-20 w-20 h-20 border border-primary/20 rounded-full animate-spin duration-[25000ms]'></div>
      <div className='absolute bottom-1/3 left-16 w-16 h-16 border-2 border-white/10 rounded-full animate-pulse duration-[6000ms]'></div>

      {/* ✅ Trailer Player Modal */}
      <TrailerPlayer
        trailers={show?.movie?.trailers || []}
        isOpen={showTrailerPlayer}
        onClose={() => setShowTrailerPlayer(false)}
        autoPlay={true}
      />
    </div>
  ) : (
    <Loading />
  )
}

export default MovieDetails