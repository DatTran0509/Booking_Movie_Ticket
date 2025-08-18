import React, { useState, useEffect } from 'react'
import BlurCircle from './BlurCircle'
import { ChevronLeftIcon, ChevronRightIcon, Calendar, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
const DateSlect = ({ dateTime, id }) => {
  const [selectedDate, setSelectedDate] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(0)
  const navigate =useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Get dates array and group by weeks
  const dates = Object.keys(dateTime)
  const datesPerWeek = 7
  const totalWeeks = Math.ceil(dates.length / datesPerWeek)
  
  const getCurrentWeekDates = () => {
    const startIndex = currentWeek * datesPerWeek
    return dates.slice(startIndex, startIndex + datesPerWeek)
  }

  const handlePrevWeek = () => {
    if (currentWeek > 0) {
      setCurrentWeek(currentWeek - 1)
    }
  }

  const handleNextWeek = () => {
    if (currentWeek < totalWeeks - 1) {
      setCurrentWeek(currentWeek + 1)
    }
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      weekday: date.toLocaleDateString("en-US", { weekday: "short" })
    }
  }

  const isToday = (dateString) => {
    const today = new Date()
    const date = new Date(dateString)
    return today.toDateString() === date.toDateString()
  }

  const onBookHandler = () => {
    if(!selectedDate) {
        return toast.error("Please select a date first")
    }
    navigate(`/movies/${id}/${selectedDate}`)
    scrollTo(0, 0)
  }

  


  return (
    <div id='date-select' className='pt-16 pb-8'>
      <div className={`relative overflow-hidden transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        {/* Background Effects */}
        <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 rounded-2xl'></div>
        <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent'></div>
        
        {/* Floating Particles */}
        <div className='absolute top-4 right-8 w-2 h-2 bg-primary/40 rounded-full animate-pulse duration-[3000ms]'></div>
        <div className='absolute bottom-4 left-8 w-1 h-1 bg-white/30 rounded-full animate-bounce delay-1000'></div>
        
        <BlurCircle top='-80px' left='-80px' />
        <BlurCircle bottom='-60px' right='-60px' />

        <div className='relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl'>
          
          {/* Date Selection Section */}
          <div className='flex-1 w-full'>
            {/* Header */}
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center'>
                <Calendar className='w-5 h-5 text-primary' />
              </div>
              <div>
                <h3 className='text-xl font-bold text-white'>Choose Date</h3>
                <p className='text-gray-400 text-sm'>Select your preferred showtime</p>
              </div>
            </div>

            {/* Date Picker */}
            <div className='flex items-center gap-4'>
              {/* Previous Week Button */}
              <button 
                onClick={handlePrevWeek}
                disabled={currentWeek === 0}
                className={`group w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentWeek === 0 
                    ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed' 
                    : 'bg-white/10 hover:bg-primary/20 text-white hover:text-primary border border-white/20 hover:border-primary/40 hover:scale-110'
                }`}
              >
                <ChevronLeftIcon className='w-5 h-5' />
              </button>

              {/* Date Grid */}
              <div className='flex-1 overflow-hidden'>
                <div className='grid grid-cols-3 md:grid-cols-7 gap-3 max-w-2xl mx-auto'>
                  {getCurrentWeekDates().map((date, index) => {
                    const dateInfo = formatDate(date)
                    const isSelected = selectedDate === date
                    const todayDate = isToday(date)
                    
                    return (
                      <button
                        key={date}
                        onClick={() => handleDateSelect(date)}
                        className={`group relative h-16 w-full rounded-xl transition-all duration-300 hover:scale-105 ${
                          isSelected
                            ? 'bg-gradient-to-br from-primary to-primary-dull text-white shadow-lg shadow-primary/30'
                            : todayDate
                            ? 'bg-white/15 border-2 border-primary/50 text-white hover:bg-white/20'
                            : 'bg-white/5 border border-white/10 hover:bg-white/15 hover:border-primary/30 text-gray-300 hover:text-white'
                        }`}
                        style={{
                          animationDelay: `${index * 100}ms`
                        }}
                      >
                        {/* Selection Glow Effect */}
                        {isSelected && (
                          <div className='absolute inset-0 bg-primary/20 rounded-xl blur-sm animate-pulse'></div>
                        )}
                        
                        <div className='relative z-10 flex flex-col items-center justify-center h-full'>
                          <span className={`text-xs font-medium mb-1 ${
                            isSelected ? 'text-white' : 'text-gray-400'
                          }`}>
                            {dateInfo.weekday}
                          </span>
                          <span className={`text-lg font-bold ${
                            isSelected ? 'text-white' : todayDate ? 'text-primary' : 'text-white'
                          }`}>
                            {dateInfo.day}
                          </span>
                          <span className={`text-xs ${
                            isSelected ? 'text-white/90' : 'text-gray-500'
                          }`}>
                            {dateInfo.month}
                          </span>
                        </div>

                        {/* Today Indicator */}
                        {todayDate && !isSelected && (
                          <div className='absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse'></div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Next Week Button */}
              <button 
                onClick={handleNextWeek}
                disabled={currentWeek >= totalWeeks - 1}
                className={`group w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentWeek >= totalWeeks - 1
                    ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed' 
                    : 'bg-white/10 hover:bg-primary/20 text-white hover:text-primary border border-white/20 hover:border-primary/40 hover:scale-110'
                }`}
              >
                <ChevronRightIcon className='w-5 h-5' />
              </button>
            </div>

            {/* Selected Date Info */}
            {selectedDate && (
              <div className={`mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20 transition-all duration-500 ${
                selectedDate ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                <div className='flex items-center gap-3'>
                  <Clock className='w-4 h-4 text-primary' />
                  <span className='text-white font-medium'>
                    Selected: {new Date(selectedDate).toLocaleDateString("en-US", { 
                      weekday: "long", 
                      year: "numeric", 
                      month: "long", 
                      day: "numeric" 
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Book Now Button */}
          <div className='flex-shrink-0'>
            <button 
              onClick={onBookHandler}
              disabled={!selectedDate}
              className={`group relative px-8 py-4 rounded-full font-semibold transition-all duration-300 ${
                selectedDate
                  ? 'bg-gradient-to-r from-primary to-primary-dull hover:from-primary-dull hover:to-primary text-white hover:scale-105 shadow-lg shadow-primary/20 hover:shadow-primary/40'
                  : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
              }`}
            >
              {/* Button Glow Effect */}
              {selectedDate && (
                <div className='absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse'></div>
              )}
              
              <span className='relative z-10 flex items-center gap-2'>
                <Calendar className='w-4 h-4' />
                Book Now
              </span>
            </button>
          </div>
        </div>

        {/* Week Indicator */}
        <div className='flex justify-center mt-4 gap-2'>
          {Array.from({ length: totalWeeks }, (_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentWeek 
                  ? 'bg-primary scale-125' 
                  : 'bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default DateSlect
