import React, { useState, useEffect } from 'react'
import { dummyTrailers } from '../assets/assets'
import ReactPlayer from 'react-player'
import BlurCircle from './BlurCircle'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

const TrailersSection = () => {
    const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0])
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true)
        }, 200)
        return () => clearTimeout(timer)
    }, [])

    // Debug: Log current trailer
    console.log('Current trailer:', currentTrailer)
    console.log('Video URL:', currentTrailer?.videoUrl)

    // Extract video title from URL for display
    const getVideoTitle = (url) => {
        if (!url) return 'Untitled'
        const videoId = url.split('v=')[1]?.split('&')[0]
        return `Movie Trailer ${videoId ? videoId.substring(0, 8) : ''}`
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
                </div>
            </div>

            {/* Video Player Container */}
            <div className={`relative mt-6 transition-all duration-1000 delay-300 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
            }`}>
                <BlurCircle top='-100px' right='-100px' />
                
                {/* Video Player Wrapper */}
                <div className='relative mx-auto max-w-[960px] bg-black/50 rounded-2xl overflow-hidden border border-white/10 backdrop-blur-sm'>
                    {/* Video Player */}
                    <div className='relative aspect-video'>
                        {currentTrailer?.videoUrl ? (
                            <ReactPlayer 
                                url={currentTrailer.videoUrl}
                                controls={false}
                                playing={isPlaying}
                                muted={isMuted}
                                width='100%'
                                height='100%'
                                className='react-player'
                                onError={(error) => {
                                    console.error('Video error:', error)
                                }}
                                onStart={() => {
                                    console.log('Video started')
                                }}
                                onPlay={() => {
                                    console.log('Video is playing')
                                }}
                                onPause={() => {
                                    console.log('Video paused')
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
                        ) : (
                            <div className='flex items-center justify-center h-full bg-gray-800 text-white'>
                                <div className='text-center'>
                                    <Play className='w-16 h-16 text-white/40 mx-auto mb-4' />
                                    <p className='text-lg'>No video URL available</p>
                                    <p className='text-sm text-gray-400 mt-2'>Check console for details</p>
                                </div>
                            </div>
                        )}
                        
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
                        <h3 className='text-xl font-bold text-white mb-2'>
                            {getVideoTitle(currentTrailer?.videoUrl)}
                        </h3>
                        <p className='text-gray-300 text-sm'>
                            Official movie trailer - Click play to watch
                        </p>
                        
                        {/* Status info */}
                        <div className='mt-4 flex items-center gap-4 text-xs text-gray-400'>
                            <span className={`px-2 py-1 rounded ${isPlaying ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20'}`}>
                                {isPlaying ? '▶ Playing' : '⏸ Paused'}
                            </span>
                            <span className={`px-2 py-1 rounded ${isMuted ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'}`}>
                                {isMuted ? '🔇 Muted' : '🔊 Sound On'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trailer Selection */}
            {dummyTrailers && dummyTrailers.length > 1 && (
                <div className={`mt-8 transition-all duration-1000 delay-500 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                }`}>
                    <h3 className='text-lg font-semibold text-white mb-4'>More Trailers</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {dummyTrailers.map((trailer, index) => (
                            <div
                                key={index}
                                onClick={() => {
                                    setCurrentTrailer(trailer)
                                    setIsPlaying(false)
                                    console.log('Switching to trailer:', trailer.videoUrl)
                                }}
                                className={`group cursor-pointer bg-white/5 hover:bg-white/10 rounded-lg p-4 border transition-all duration-300 hover:scale-105 ${
                                    currentTrailer?.videoUrl === trailer.videoUrl 
                                        ? 'border-primary/60 bg-primary/10' 
                                        : 'border-white/10 hover:border-primary/40'
                                }`}
                            >
                                <div className='aspect-video bg-gray-800 rounded-lg mb-3 overflow-hidden'>
                                    {trailer.image ? (
                                        <img 
                                            src={trailer.image} 
                                            alt={getVideoTitle(trailer.videoUrl)}
                                            className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                                        />
                                    ) : (
                                        <div className='flex items-center justify-center h-full'>
                                            <Play className='w-8 h-8 text-white/60' />
                                        </div>
                                    )}
                                    
                                    {/* Play overlay */}
                                    <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                                        <Play className='w-8 h-8 text-white' />
                                    </div>
                                </div>
                                <h4 className='text-white font-medium text-sm'>
                                    {getVideoTitle(trailer.videoUrl)}
                                </h4>
                                <p className='text-gray-400 text-xs mt-1'>
                                    {trailer.videoUrl ? '✓ Ready to play' : '✗ No video'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Decorative Elements */}
            <div className='absolute bottom-10 left-10 w-16 h-16 border border-primary/20 rounded-full animate-spin duration-[15000ms]'></div>
            <div className='absolute top-1/2 right-5 w-8 h-8 border border-white/10 rounded-full animate-pulse duration-[8000ms]'></div>
        </div>
    )
}

export default TrailersSection
