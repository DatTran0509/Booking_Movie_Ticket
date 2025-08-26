import React, { useState, useEffect } from 'react'
import ReactPlayer from 'react-player/youtube'
import { Play, Pause, Volume2, VolumeX, X, SkipBack, SkipForward, ChevronUp, ChevronDown } from 'lucide-react'

const TrailerPlayer = ({ trailers, isOpen, onClose, autoPlay = false }) => {
    const [currentTrailerIndex, setCurrentTrailerIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(autoPlay)
    const [isMuted, setIsMuted] = useState(true)
    const [showAllTrailers, setShowAllTrailers] = useState(false)

    const currentTrailer = trailers[currentTrailerIndex]

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    const handleNext = () => {
        if (currentTrailerIndex < trailers.length - 1) {
            setCurrentTrailerIndex(prev => prev + 1)
            setIsPlaying(true)
        }
    }

    const handlePrevious = () => {
        if (currentTrailerIndex > 0) {
            setCurrentTrailerIndex(prev => prev - 1)
            setIsPlaying(true)
        }
    }

    const handleTrailerSelect = (index) => {
        setCurrentTrailerIndex(index)
        setIsPlaying(true)
    }

    if (!isOpen || !trailers || trailers.length === 0) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-60 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/20"
            >
                <X className="w-6 h-6 text-white" />
            </button>

            {/* ✅ Thêm scroll cho toàn bộ content */}
            <div className="w-full max-w-6xl mx-auto h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent hover:scrollbar-thumb-white/40">
                <div className="min-h-full flex flex-col py-16"> {/* Thêm padding top/bottom để tránh close button */}
                    
                    {/* Main Video Player */}
                    <div className="flex-shrink-0 bg-black rounded-2xl overflow-hidden border border-white/10 mb-6">
                        <div className="relative aspect-video">
                            <ReactPlayer
                                url={currentTrailer?.youtube_url || `https://www.youtube.com/watch?v=${currentTrailer?.key}`}
                                width="100%"
                                height="100%"
                                playing={isPlaying}
                                muted={isMuted}
                                controls={false}
                                onEnded={() => handleNext()}
                                config={{
                                    youtube: {
                                        playerVars: {
                                            showinfo: 0,
                                            modestbranding: 1,
                                            rel: 0
                                        }
                                    }
                                }}
                            />

                            {/* Custom Controls Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                {/* Play/Pause Button */}
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-110"
                                >
                                    {isPlaying ? (
                                        <Pause className="w-8 h-8 text-white" />
                                    ) : (
                                        <Play className="w-8 h-8 text-white ml-1" />
                                    )}
                                </button>

                                {/* Navigation Controls */}
                                {trailers.length > 1 && (
                                    <>
                                        {currentTrailerIndex > 0 && (
                                            <button
                                                onClick={handlePrevious}
                                                className="absolute left-6 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-110"
                                            >
                                                <SkipBack className="w-6 h-6 text-white" />
                                            </button>
                                        )}

                                        {currentTrailerIndex < trailers.length - 1 && (
                                            <button
                                                onClick={handleNext}
                                                className="absolute right-6 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-110"
                                            >
                                                <SkipForward className="w-6 h-6 text-white" />
                                            </button>
                                        )}
                                    </>
                                )}

                                {/* Bottom Controls */}
                                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                                    {/* Mute Button */}
                                    <button
                                        onClick={() => setIsMuted(!isMuted)}
                                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 transition-all duration-300"
                                    >
                                        {isMuted ? (
                                            <VolumeX className="w-5 h-5 text-white" />
                                        ) : (
                                            <Volume2 className="w-5 h-5 text-white" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Video Info */}
                        <div className="p-6 bg-gradient-to-r from-black/80 to-black/60">
                            <h3 className="text-xl font-bold text-white mb-2">
                                {currentTrailer?.name || 'Movie Trailer'}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span>Trailer {currentTrailerIndex + 1} of {trailers.length}</span>
                                {currentTrailer?.published_at && (
                                    <span>Published: {new Date(currentTrailer.published_at).toLocaleDateString()}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ✅ All Trailers Section - Bỏ flex-1 và min-h-0 để cho phép mở rộng tự nhiên */}
                    {trailers.length > 1 && (
                        <div className="bg-white/5 rounded-xl border border-white/10">
                            {/* Header với Toggle */}
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                                <h4 className="text-white font-semibold text-lg">
                                    All Trailers ({trailers.length})
                                </h4>
                                <button
                                    onClick={() => setShowAllTrailers(!showAllTrailers)}
                                    className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300"
                                >
                                    <span className="text-white text-sm">
                                        {showAllTrailers ? 'Collapse' : 'Expand'}
                                    </span>
                                    {showAllTrailers ? (
                                        <ChevronUp className="w-4 h-4 text-white" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-white" />
                                    )}
                                </button>
                            </div>

                            {/* ✅ Content - Không giới hạn chiều cao, để mở rộng tự nhiên */}
                            <div className={`transition-all duration-500 overflow-hidden ${
                                showAllTrailers ? 'max-h-none' : 'max-h-32'
                            }`}>
                                <div className="p-4 space-y-3">
                                    {trailers.map((trailer, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleTrailerSelect(index)}
                                            className={`w-full flex items-center gap-4 p-3 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${
                                                index === currentTrailerIndex 
                                                    ? 'border-primary/60 bg-primary/10 shadow-lg shadow-primary/20' 
                                                    : 'border-white/10 hover:border-primary/40 bg-white/5 hover:bg-white/10'
                                            }`}
                                        >
                                            {/* Thumbnail */}
                                            <div className="relative w-20 h-12 flex-shrink-0 rounded-lg overflow-hidden">
                                                <img
                                                    src={trailer.thumbnail_url || `https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`}
                                                    alt={trailer.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = `https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <Play className="w-4 h-4 text-white" />
                                                </div>
                                                
                                                {/* Current Playing Indicator */}
                                                {index === currentTrailerIndex && (
                                                    <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 text-left">
                                                <h5 className="text-white font-medium text-sm line-clamp-1 mb-1">
                                                    {trailer.name || `Trailer ${index + 1}`}
                                                </h5>
                                                <div className="flex items-center gap-2 text-xs">
                                                    {trailer.official && (
                                                        <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full border border-primary/30">
                                                            Official
                                                        </span>
                                                    )}
                                                    {trailer.published_at && (
                                                        <span className="text-gray-400">
                                                            {new Date(trailer.published_at).getFullYear()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="flex-shrink-0">
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    index === currentTrailerIndex
                                                        ? 'bg-primary/20 text-primary border border-primary/30'
                                                        : 'bg-gray-600/20 text-gray-400'
                                                }`}>
                                                    {index === currentTrailerIndex ? (
                                                        isPlaying ? '▶ Playing' : '⏸ Current'
                                                    ) : 'Play'}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Navigation Footer */}
                            {trailers.length > 1 && (
                                <div className="p-3 border-t border-white/10 bg-white/5">
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span>Use ← → keys or click to navigate</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={handlePrevious}
                                                disabled={currentTrailerIndex === 0}
                                                className="w-6 h-6 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded flex items-center justify-center transition-all duration-300"
                                            >
                                                <ChevronUp className="w-3 h-3 text-white rotate-[-90deg]" />
                                            </button>
                                            <span className="px-2 py-1 bg-white/10 rounded text-white">
                                                {currentTrailerIndex + 1}/{trailers.length}
                                            </span>
                                            <button
                                                onClick={handleNext}
                                                disabled={currentTrailerIndex === trailers.length - 1}
                                                className="w-6 h-6 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded flex items-center justify-center transition-all duration-300"
                                            >
                                                <ChevronUp className="w-3 h-3 text-white rotate-90" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ✅ Keyboard Navigation */}
            <div 
                className="fixed inset-0 pointer-events-none"
                onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft' && currentTrailerIndex > 0) {
                        handlePrevious()
                    } else if (e.key === 'ArrowRight' && currentTrailerIndex < trailers.length - 1) {
                        handleNext()
                    } else if (e.key === 'Space') {
                        e.preventDefault()
                        setIsPlaying(!isPlaying)
                    } else if (e.key === 'Escape') {
                        onClose()
                    }
                }}
                tabIndex={0}
                autoFocus
            />
        </div>
    )
}

export default TrailerPlayer