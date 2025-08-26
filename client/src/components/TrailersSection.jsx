import React, { useState, useEffect,useRef } from 'react'
import ReactPlayer from 'react-player'
import BlurCircle from './BlurCircle'
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

const TrailersSection = () => {
    const { shows, image_base_url } = useAppContext()
    const [allTrailers, setAllTrailers] = useState([])
    const [currentTrailer, setCurrentTrailer] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [isVisible, setIsVisible] = useState(false)
    const [carouselIndex, setCarouselIndex] = useState(0)
    // ✅ Add user interaction states
    const [isUserInteracting, setIsUserInteracting] = useState(false)
    const [pauseCountdown, setPauseCountdown] = useState(0)
    
    const autoScrollIntervalRef = useRef(null)
    const pauseTimeoutRef = useRef(null)
    const countdownIntervalRef = useRef(null)
    // ✅ Extract all trailers from movies in database
    useEffect(() => {
        if (shows && shows.length > 0) {
            const trailersFromDB = []
            
            shows.forEach(show => {
                if (show && show.trailers && show.trailers.length > 0) {
                    show.trailers.forEach(trailer => {
                        trailersFromDB.push({
                            ...trailer,
                            movieTitle: show.title,
                            moviePoster: show.poster_path,
                            movieBackdrop: show.backdrop_path,
                            movieId: show._id,
                            vote_average: show.vote_average
                        })
                    })
                }
            })

            // ✅ Sort by movie rating and trailer official status
            const sortedTrailers = trailersFromDB.sort((a, b) => {
                if (a.official !== b.official) return b.official - a.official
                return b.vote_average - a.vote_average
            })

            setAllTrailers(sortedTrailers)
            if (sortedTrailers.length > 0) {
                setCurrentTrailer(sortedTrailers[0])
            }

            // console.log('🎬 Loaded trailers from database:', sortedTrailers.length)
        }
    }, [shows])

     // ✅ Auto-scroll logic với user interaction detection
     useEffect(() => {
        const startAutoScroll = () => {
            if (autoScrollIntervalRef.current) {
                clearInterval(autoScrollIntervalRef.current)
            }

            autoScrollIntervalRef.current = setInterval(() => {
                if (!isUserInteracting && allTrailers.length > 2) {
                    setCarouselIndex(prev => {
                        // ✅ Move by 2 items each time
                        const nextIndex = prev + 2
                        return nextIndex >= allTrailers.length ? 0 : nextIndex
                    })
                }
            }, 3000) // 2 seconds
        }

        if (allTrailers.length > 2 && !isUserInteracting) {
            startAutoScroll()
        }

        return () => {
            if (autoScrollIntervalRef.current) {
                clearInterval(autoScrollIntervalRef.current)
            }
        }
    }, [allTrailers.length, isUserInteracting])

    // ✅ Handle user interaction pause with countdown
    const handleUserInteraction = () => {
        setIsUserInteracting(true)
        setPauseCountdown(4) // 3 seconds countdown

        // Clear existing timers
        if (pauseTimeoutRef.current) {
            clearTimeout(pauseTimeoutRef.current)
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current)
        }

        // Start countdown
        countdownIntervalRef.current = setInterval(() => {
            setPauseCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownIntervalRef.current)
                    setIsUserInteracting(false)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        // Backup timeout in case interval fails
        pauseTimeoutRef.current = setTimeout(() => {
            setIsUserInteracting(false)
            setPauseCountdown(0)
        }, 4000)
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true)
        }, 200)
        return () => clearTimeout(timer)
    }, [])

    // ✅ Get visible trailers for carousel (show 4 at a time)
    const getVisibleTrailers = () => {
        if (allTrailers.length === 0) return []
        
        const visibleCount = 4
        const visible = []
        
        for (let i = 0; i < visibleCount; i++) {
            const index = (carouselIndex + i) % allTrailers.length
            visible.push(allTrailers[index])
        }
        
        return visible
    }

    const handleTrailerSelect = (trailer) => {
        setCurrentTrailer(trailer)
        setIsPlaying(false)
        handleUserInteraction() // ✅ Pause auto-scroll
    }

    const handlePrevious = () => {
        setCarouselIndex(prev => {
            // ✅ Move by 2 items
            const newIndex = prev - 2
            return newIndex < 0 ? Math.max(0, allTrailers.length - 2) : newIndex
        })
        handleUserInteraction() // ✅ Pause auto-scroll
    }

    const handleNext = () => {
        setCarouselIndex(prev => {
            // ✅ Move by 2 items
            const nextIndex = prev + 2
            return nextIndex >= allTrailers.length ? 0 : nextIndex
        })
        handleUserInteraction() // ✅ Pause auto-scroll
    }

    // ✅ Handle dot navigation
    const handleDotClick = (dotIndex) => {
        setCarouselIndex(dotIndex * 2) // Each dot represents 2 items
        handleUserInteraction()
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (autoScrollIntervalRef.current) {
                clearInterval(autoScrollIntervalRef.current)
            }
            if (pauseTimeoutRef.current) {
                clearTimeout(pauseTimeoutRef.current)
            }
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current)
            }
        }
    }, [])

    if (!allTrailers || allTrailers.length === 0) {
        return (
            <div className='relative px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden py-20 bg-black/95'>
                <div className='text-center text-white'>
                    <h2 className='text-3xl font-bold mb-4'>Featured Trailers</h2>
                    <p className='text-gray-400'>No trailers available at the moment</p>
                </div>
            </div>
        )
    }

    return (
        <div className='relative px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden py-20 bg-black/95'>
            {/* Background Effects */}
            <div className='absolute top-20 left-10 w-2 h-2 bg-primary/60 rounded-full animate-pulse duration-[4000ms]'></div>
            <div className='absolute bottom-32 right-20 w-1 h-1 bg-white/40 rounded-full animate-bounce delay-1000'></div>
            
            {/* Header */}
            <div className={`mb-8 transition-all duration-1000 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
                <div className='relative'>
                    <div className='absolute inset-0 bg-white/10 blur-lg rounded-lg animate-pulse duration-[6000ms]'></div>
                    <h2 className='relative text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2'>
                        Featured Trailers
                    </h2>
                    <div className='w-32 h-1 bg-gradient-to-r from-primary to-primary-dull rounded-full animate-pulse duration-[3000ms]'></div>
                    <p className='text-gray-400 mt-4'>
                        Watch the latest movie trailers from our cinema collection
                    </p>
                </div>
            </div>

            {/* Main Video Player */}
            {currentTrailer && (
                <div className={`relative mt-6 transition-all duration-1000 delay-300 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                }`}>
                    <BlurCircle top='-100px' right='-100px' />
                    
                    {/* Video Player Wrapper */}
                    <div className='relative mx-auto max-w-[960px] bg-black/50 rounded-2xl overflow-hidden border border-white/10 backdrop-blur-sm'>
                        {/* Video Player */}
                        <div className='relative aspect-video'>
                            <ReactPlayer 
                                url={currentTrailer.youtube_url || `https://www.youtube.com/watch?v=${currentTrailer.key}`}
                                controls={false}
                                playing={isPlaying}
                                muted={isMuted}
                                width='100%'
                                height='100%'
                                className='react-player'
                                onError={(error) => {
                                    console.error('Video error:', error)
                                }}
                                config={{
                                    youtube: {
                                        playerVars: {
                                            showinfo: 0,
                                            modestbranding: 1,
                                            autoplay: 0,
                                            rel: 0
                                        }
                                    }
                                }}
                            />
                            
                            {/* Custom Controls Overlay */}
                            <div className='absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className='group flex items-center justify-center w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm border border-white/30 hover:border-primary/60 transition-all duration-300 hover:scale-110'
                                >
                                    {isPlaying ? (
                                        <Pause className='w-8 h-8 text-white group-hover:text-primary transition-colors duration-300' />
                                    ) : (
                                        <Play className='w-8 h-8 text-white group-hover:text-primary transition-colors duration-300 ml-1' />
                                    )}
                                </button>
                                
                                {/* Mute Button */}
                                <button
                                    onClick={() => setIsMuted(!isMuted)}
                                    className='absolute bottom-4 right-4 flex items-center justify-center w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm border border-white/30 hover:border-primary/60 transition-all duration-300 hover:scale-110'
                                >
                                    {isMuted ? (
                                        <VolumeX className='w-5 h-5 text-white hover:text-primary transition-colors duration-300' />
                                    ) : (
                                        <Volume2 className='w-5 h-5 text-white hover:text-primary transition-colors duration-300' />
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        {/* Video Info */}
                        <div className='p-6 bg-gradient-to-r from-black/80 via-black/60 to-black/80 backdrop-blur-sm'>
                            <div className='flex items-start justify-between'>
                                <div>
                                    <h3 className='text-xl font-bold text-white mb-2'>
                                        {currentTrailer.name || `${currentTrailer.movieTitle} - Official Trailer`}
                                    </h3>
                                    <p className='text-gray-300 text-sm mb-3'>
                                        From: <span className='text-primary font-medium'>{currentTrailer.movieTitle}</span>
                                    </p>
                                    
                                    {/* Movie Rating */}
                                    <div className='flex items-center gap-2'>
                                        <div className='flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-full border border-yellow-500/30'>
                                            <span className='text-yellow-500 text-xs'>★</span>
                                            <span className='text-yellow-500 font-bold text-xs'>
                                                {currentTrailer.vote_average?.toFixed(1)}
                                            </span>
                                        </div>
                                        {currentTrailer.official && (
                                            <span className='px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full border border-primary/30'>
                                                Official
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Status info with countdown */}
                                <div className='flex flex-col gap-2 text-xs'>
                                    <span className={`px-3 py-1 rounded-full text-center ${isPlaying ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'}`}>
                                        {isPlaying ? '▶ Playing' : '⏸ Paused'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-center ${isMuted ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'}`}>
                                        {isMuted ? '🔇 Muted' : '🔊 Sound'}
                                    </span>
                                    {/* ✅ Show countdown when user is interacting */}
                                    {isUserInteracting && (
                                        <span className='px-3 py-1 bg-orange-600/20 text-orange-400 rounded-full text-center'>
                                            Auto-scroll: {pauseCountdown}s
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Auto-Scrolling Trailer Carousel */}
            {allTrailers.length > 1 && (
                <div className={`mt-12 transition-all duration-1000 delay-500 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                }`}>
                    <div className='flex items-center justify-between mb-6'>
                        <div className='flex items-center gap-4'>
                            <h3 className='text-2xl font-bold text-white'>More Trailers</h3>
                            {/* ✅ Auto-scroll status indicator */}
                            <div className='flex items-center gap-2'>
                                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    isUserInteracting ? 'bg-orange-500 animate-pulse' : 'bg-green-500 animate-pulse'
                                }`}></div>
                                <span className='text-xs text-gray-400'>
                                    {isUserInteracting ? `Paused (${pauseCountdown}s)` : 'Auto-scrolling'}
                                </span>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <button
                                onClick={handlePrevious}
                                className='w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/20'
                            >
                                <ChevronLeft className='w-5 h-5 text-white' />
                            </button>
                            <button
                                onClick={handleNext}
                                className='w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/20'
                            >
                                <ChevronRight className='w-5 h-5 text-white' />
                            </button>
                        </div>
                    </div>

                    {/* ✅ Carousel Container */}
                    <div className='relative overflow-hidden'>
                        <div 
                            className='flex transition-transform duration-500 ease-in-out gap-4'
                            style={{
                                transform: `translateX(-${carouselIndex * (100 / 4)}%)`
                            }}
                        >
                            {allTrailers.map((trailer, index) => (
                                <div
                                    key={`${trailer.movieId}-${trailer.key}-${index}`}
                                    onClick={() => handleTrailerSelect(trailer)}
                                    className={`group cursor-pointer bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden border transition-all duration-300 hover:scale-105 flex-shrink-0 w-[calc(25%-12px)] ${
                                        currentTrailer?.key === trailer.key 
                                            ? 'border-primary/60 bg-primary/10 shadow-lg shadow-primary/20' 
                                            : 'border-white/10 hover:border-primary/40'
                                    }`}
                                >
                                    {/* Trailer Thumbnail */}
                                    <div className='relative aspect-video overflow-hidden'>
                                        {trailer.thumbnail_url || trailer.key ? (
                                            <img 
                                                src={trailer.thumbnail_url || `https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`}
                                                alt={trailer.name || trailer.movieTitle}
                                                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                                                onError={(e) => {
                                                    // Fallback to movie poster if YouTube thumbnail fails
                                                    e.target.src = image_base_url + trailer.moviePoster
                                                }}
                                            />
                                        ) : (
                                            <div className='w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center'>
                                                <Play className='w-12 h-12 text-white/40' />
                                            </div>
                                        )}
                                        
                                        {/* Play Overlay */}
                                        <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                                            <div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30'>
                                                <Play className='w-6 h-6 text-white ml-0.5' />
                                            </div>
                                        </div>

                                        {/* Movie Rating Badge */}
                                        <div className='absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/70 rounded-full backdrop-blur-sm'>
                                            <span className='text-yellow-500 text-xs'>★</span>
                                            <span className='text-white text-xs font-bold'>
                                                {trailer.vote_average?.toFixed(1)}
                                            </span>
                                        </div>

                                        {/* Official Badge */}
                                        {trailer.official && (
                                            <div className='absolute top-2 left-2 px-2 py-1 bg-primary/80 text-white text-xs font-medium rounded-full backdrop-blur-sm'>
                                                Official
                                            </div>
                                        )}
                                    </div>

                                    {/* Trailer Info */}
                                    <div className='p-4'>
                                        <h4 className='text-white font-semibold text-sm mb-1 line-clamp-1'>
                                            {trailer.movieTitle}
                                        </h4>
                                        <p className='text-gray-400 text-xs mb-2 line-clamp-1'>
                                            {trailer.name || 'Official Trailer'}
                                        </p>
                                        
                                        <div className='flex items-center justify-between'>
                                            <span className='text-xs text-gray-500'>
                                                {trailer.published_at ? new Date(trailer.published_at).getFullYear() : 'Latest'}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                currentTrailer?.key === trailer.key
                                                    ? 'bg-primary/20 text-primary'
                                                    : 'bg-gray-600/20 text-gray-400'
                                            }`}>
                                                {currentTrailer?.key === trailer.key ? 'Playing' : 'Play'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ✅ Updated Auto-scroll Indicator - shows every 2 items */}
                    <div className='flex justify-center mt-6 gap-2'>
                        {Array.from({ length: Math.ceil(allTrailers.length / 2) }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => handleDotClick(i)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    Math.floor(carouselIndex / 2) === i
                                        ? 'bg-primary w-6'
                                        : 'bg-white/30 hover:bg-white/50'
                                }`}
                            />
                        ))}
                    </div>

                    {/* ✅ Updated Progress Bar for Auto-scroll (every 2 items) */}
                    <div className='mt-4 w-full bg-white/10 rounded-full h-1 overflow-hidden'>
                        <div 
                            className={`h-full bg-gradient-to-r from-primary to-primary-dull transition-all ease-linear ${
                                isUserInteracting ? 'duration-0' : 'duration-[2000ms]'
                            }`}
                            style={{
                                width: `${((Math.floor(carouselIndex / 2) + 1) / Math.ceil(allTrailers.length / 2)) * 100}%`
                            }}
                        />
                    </div>

                    {/* ✅ User interaction hint */}
                    {!isUserInteracting && allTrailers.length > 4 && (
                        <p className='text-center text-gray-500 text-xs mt-2'>
                            Click any trailer or navigation to pause auto-scroll for 3 seconds
                        </p>
                    )}
                </div>
            )}

            {/* Decorative Elements */}
            <div className='absolute bottom-10 left-10 w-16 h-16 border border-primary/20 rounded-full animate-spin duration-[15000ms]'></div>
            <div className='absolute top-1/2 right-5 w-8 h-8 border border-white/10 rounded-full animate-pulse duration-[8000ms]'></div>
        </div>
    )
}

export default TrailersSection