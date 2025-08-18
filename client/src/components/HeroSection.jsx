import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { CalendarIcon, ClockIcon, PlayIcon, PlusIcon, Film, Compass } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [titleAnimationKey, setTitleAnimationKey] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    // Initial animation
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    // Repeat title animation every 5 seconds
    const titleInterval = setInterval(() => {
      setTitleAnimationKey(prev => prev + 1)
    }, 5000)

    return () => {
      clearTimeout(timer)
      clearInterval(titleInterval)
    }
  }, [])

  return (
    <>
      {/* CSS styles */}
      <style>{`
        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes zoomIn {
          0% {
            opacity: 0;
            transform: translateY(15px) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
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
      `}</style>

      <div className='relative flex flex-col items-start justify-center gap-6 px-6 md:px-16 lg:px-36 h-screen text-white overflow-hidden'>
        {/* Animated Background with Parallax Effect - Brighter */}
        <div className='absolute inset-0 bg-[url("/backgroundImage.png")] bg-cover bg-center transform scale-120 brightness-110'></div>
        
        {/* Lighter Background Overlays - Slower */}
        <div className='absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/20 animate-pulse duration-[8000ms]'></div>
        <div className='absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/50'></div>
        <div className='absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent animate-pulse duration-[6000ms]'></div>
        
        {/* Enhanced Floating Particles - Brighter */}
        <div className='absolute top-20 left-20 w-3 h-3 bg-primary/90 rounded-full animate-bounce duration-[4000ms]'></div>
        <div className='absolute top-40 right-32 w-2 h-2 bg-white/70 rounded-full animate-ping duration-[3000ms] delay-1000'></div>
        <div className='absolute bottom-40 left-16 w-2 h-2 bg-primary/90 rounded-full animate-pulse duration-[5000ms] delay-2000'></div>
        <div className='absolute top-60 right-20 w-1 h-1 bg-white/60 rounded-full animate-bounce delay-500'></div>
        <div className='absolute top-80 left-1/3 w-1.5 h-1.5 bg-primary/80 rounded-full animate-ping duration-[4000ms] delay-1500'></div>
        <div className='absolute bottom-60 right-1/4 w-2 h-2 bg-white/50 rounded-full animate-pulse duration-[6000ms] delay-3000'></div>
        
        {/* Content */}
        <div className='relative z-10 max-w-2xl'>
          {/* Marvel Logo with Enhanced Glow Effect - Slower */}
          <div className='relative mb-6'>
            {/* Enhanced glow effect behind logo - Much Slower */}
            <div className='absolute inset-0 bg-white/30 blur-xl rounded-lg animate-pulse duration-[6000ms]'></div>
            <div className='absolute inset-0 bg-primary/20 blur-2xl rounded-lg animate-pulse duration-[6000ms] delay-1000'></div>
            
            <img 
              src={assets.marvelLogo} 
              alt="Marvel Studios" 
              className={`relative max-h-8 md:max-h-10 lg:max-h-12 transition-all duration-1000 hover:scale-110 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:drop-shadow-[0_0_30px_rgba(255,255,255,0.7)] ${
                isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
              }`}
            />
          </div>
          
          {/* Animated Title with Word-by-Word Animation - Repeating every 5s */}
          <h1 className='text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-6'>
            {/* "Guardians" flies in from left */}
            <span 
              key={`guardians-${titleAnimationKey}`}
              className='inline-block bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent animate-slideInLeft'
            >
              Guardians
            </span>
            <br />
            
            {/* "of the" flies in from right with different timing */}
            <span 
              key={`ofthe-${titleAnimationKey}`}
              className='inline-block mr-4 bg-gradient-to-r from-gray-200 to-white bg-clip-text text-transparent animate-slideInRight'
            >
              of the
            </span>
            
            {/* "Galaxy" comes from bottom with scale */}
            <span 
              key={`galaxy-${titleAnimationKey}`}
              className='inline-block bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent animate-zoomIn'
            >
              Galaxy
            </span>
          </h1>
          
          {/* Movie Info with Staggered Animation */}
          <div className={`flex flex-wrap items-center gap-4 md:gap-6 mb-6 text-sm md:text-base transition-all duration-1000 delay-900 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}>
            <div className='flex items-center gap-2'>
              <span className='px-3 py-1 bg-white/15 rounded-full backdrop-blur-sm border border-white/30 hover:bg-white/25 hover:scale-105 hover:border-primary/40 transition-all duration-300 cursor-pointer'>
                Action
              </span>
              <span className='px-3 py-1 bg-white/15 rounded-full backdrop-blur-sm border border-white/30 hover:bg-white/25 hover:scale-105 hover:border-primary/40 transition-all duration-300 cursor-pointer'>
                Adventure
              </span>
              <span className='px-3 py-1 bg-white/15 rounded-full backdrop-blur-sm border border-white/30 hover:bg-white/25 hover:scale-105 hover:border-primary/40 transition-all duration-300 cursor-pointer'>
                Sci-Fi
              </span>
            </div>
          </div>
          
          {/* Year and Duration with Slide Animation - Slower icon pulse */}
          <div className={`flex items-center gap-6 mb-6 text-white/90 transition-all duration-1000 delay-1100 ${
            isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
          }`}>
            <div className='flex items-center gap-2 hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer'>
              <CalendarIcon className='w-5 h-5 text-primary animate-pulse duration-[3000ms]' />
              <span className='font-medium'>2018</span>
            </div>
            <div className='flex items-center gap-2 hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer'>
              <ClockIcon className='w-5 h-5 text-primary animate-pulse duration-[3000ms]' />
              <span className='font-medium'>2h 8m</span>
            </div>
          </div>
          
          {/* Description with Typewriter Effect */}
          <p className={`text-white/95 text-base md:text-lg leading-relaxed mb-8 max-w-xl transition-all duration-1000 delay-1300 hover:text-white ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}>
            In a post-apocalyptic world where cities ride on wheels and consume each other to survive, two people meet in London and try to stop a conspiracy.
          </p>
          
          {/* Action Buttons with Bounce In */}
          <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-1500 ${
            isLoaded ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-10 scale-95 opacity-0'
          }`}>
            <button onClick={() => navigate('/movies')} className='group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary-dull hover:from-primary-dull hover:to-primary text-white font-semibold rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/60 hover:scale-105 active:scale-95 transition-all duration-300 border border-primary/30 hover:border-primary/60 relative overflow-hidden'>
              <Film className='w-5 h-5 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300' />
              <span className='relative z-10'>Explore Movies</span>
              <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700'></div>
            </button>
            
            <button className='group flex items-center gap-3 px-8 py-4 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-full border border-white/40 hover:border-primary/40 backdrop-blur-sm hover:scale-105 transition-all duration-300 relative overflow-hidden'>
              <PlusIcon className='w-5 h-5 group-hover:rotate-180 transition-transform duration-500' />
              <span>Add to Favorites</span>
              <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700'></div>
            </button>
          </div>
        </div>
        
        {/* Enhanced Decorative Elements - Slower animations */}
        <div className='absolute bottom-10 right-10 w-20 h-20 border-2 border-primary/30 rounded-full animate-spin duration-[12000ms]'></div>
        <div className='absolute top-32 right-40 w-16 h-16 border border-white/20 rounded-full animate-bounce duration-[4000ms]'></div>
        <div className='absolute bottom-20 left-1/4 w-12 h-12 border border-primary/20 rounded-full animate-ping duration-[5000ms]'></div>
        <div className='absolute top-1/4 left-10 w-8 h-8 border border-white/10 rounded-full animate-pulse duration-[8000ms]'></div>
        
        {/* Moving Light Effects - Much Slower */}
        <div className='absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse duration-[5000ms]'></div>
        <div className='absolute bottom-0 right-0 w-2 h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-pulse duration-[6000ms]'></div>
      </div>
    </>
  )
}

export default HeroSection
