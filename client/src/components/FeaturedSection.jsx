import { ArrowRight } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BlurCircle from './BlurCircle'
import MovieCard from './MovieCard'
import { useAppContext } from '../context/AppContext'

const FeaturedSection = () => {
    const {shows} = useAppContext()

    const navigate = useNavigate()
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true)
        }, 200)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className='relative py-16 px-6 md:px-16 lg:px-36 bg-black/95 overflow-hidden'>
            {/* Background Effects */}
            <BlurCircle top='0' right='-80px' />
            <div className='absolute top-20 left-10 w-2 h-2 bg-primary/60 rounded-full animate-pulse duration-[4000ms]'></div>
            <div className='absolute bottom-32 right-20 w-1 h-1 bg-white/40 rounded-full animate-bounce delay-1000'></div>
            <div className='absolute top-40 right-1/4 w-1.5 h-1.5 bg-primary/40 rounded-full animate-ping duration-[5000ms] delay-2000'></div>

            {/* Header Section */}
            <div className={`flex items-center justify-between mb-12 transition-all duration-1000 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
                <div className='relative'>
                    {/* Title with Glow Effect */}
                    <div className='absolute inset-0 bg-white/10 blur-lg rounded-lg animate-pulse duration-[6000ms]'></div>
                    <h2 className='relative text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2'>
                        Now Showing
                    </h2>
                    <div className='w-24 h-1 bg-gradient-to-r from-primary to-primary-dull rounded-full animate-pulse duration-[3000ms]'></div>
                </div>

                {/* View All Button */}
                <button 
                    onClick={() => {
                        navigate('/movies')
                        window.scrollTo(0, 0)
                    }}
                    className='group flex items-center gap-2 px-6 py-3 text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/20 hover:border-primary/40 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105 relative overflow-hidden'
                >
                    <span className='relative z-10 font-medium'>View All</span>
                    <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform duration-300' />
                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700'></div>
                </button>
            </div>
            
            {/* ✅ Enhanced Movies Grid with Better Responsive Design */}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 lg:gap-6 mb-12'>
                {shows.slice(0, 10).map((show, index) => (
                    <div
                        key={show._id}
                        className={`transform transition-all duration-1000 ${
                            isVisible 
                                ? 'translate-y-0 opacity-100 scale-100' 
                                : 'translate-y-20 opacity-0 scale-95'
                        }`}
                        style={{ 
                            animationDelay: `${index * 100}ms`,
                            minHeight: 'fit-content'
                        }}
                    >
                        <MovieCard movie={show} />
                    </div>
                ))}
            </div>

            {/* Show More Button */}
            <div className={`flex justify-center transition-all duration-1000 delay-800 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
                <button 
                    onClick={() => {
                        navigate('/movies')
                        window.scrollTo(0, 0)
                    }}
                    className='group flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-primary to-primary-dull hover:from-primary-dull hover:to-primary text-white font-semibold rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/60 hover:scale-105 active:scale-95 transition-all duration-300 border border-primary/30 hover:border-primary/60 relative overflow-hidden'
                >
                    <span className='relative z-10'>Show More</span>
                    <ArrowRight className='w-5 h-5 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300' />
                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700'></div>
                </button>
            </div>

            {/* Decorative Elements */}
            <div className='absolute bottom-10 left-10 w-16 h-16 border border-primary/20 rounded-full animate-spin duration-[15000ms]'></div>
            <div className='absolute top-1/2 right-5 w-8 h-8 border border-white/10 rounded-full animate-pulse duration-[8000ms]'></div>
            
            {/* Light Effects */}
            <div className='absolute top-0 left-1/4 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse duration-[6000ms]'></div>
            <div className='absolute bottom-0 right-1/3 w-1 h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-pulse duration-[8000ms]'></div>
        </div>
    )
}

export default FeaturedSection
