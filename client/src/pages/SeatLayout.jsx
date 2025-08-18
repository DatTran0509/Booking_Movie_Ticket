import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { assets, dummyDateTimeData, dummyShowsData } from '../assets/assets'
import Loading from '../components/Loading'
import { ClockIcon, ArrowRight, Users, Calendar, Star, MapPin, ArrowLeft } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import toast from 'react-hot-toast'
import timeFormat from '../lib/timeFormat'

const SeatLayout = () => {
  const { id, date } = useParams()
  const navigate = useNavigate()
  
  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  // Seat configuration với pricing tiers
  const seatRows = [
    { row: 'A', count: 9, type: 'front', price: 120, label: 'Front Premium' },
    { row: 'B', count: 9, type: 'front', price: 120, label: 'Front Premium' },
    { row: 'C', count: 18, type: 'middle', price: 150, label: 'Middle VIP' },
    { row: 'D', count: 18, type: 'middle', price: 150, label: 'Middle VIP' },
    { row: 'E', count: 18, type: 'middle', price: 150, label: 'Middle VIP' },
    { row: 'F', count: 18, type: 'middle', price: 150, label: 'Middle VIP' },
    { row: 'G', count: 18, type: 'middle', price: 150, label: 'Middle VIP' },
    { row: 'H', count: 18, type: 'back', price: 100, label: 'Back Standard' },
    { row: 'I', count: 18, type: 'back', price: 100, label: 'Back Standard' },
    { row: 'J', count: 18, type: 'back', price: 100, label: 'Back Standard' }
  ]

  // Mock occupied seats
  const occupiedSeats = ['A5', 'A6', 'B4', 'C5', 'C6', 'C12', 'C13', 'D4', 'D5', 'D15', 'E8', 'E16', 'F3', 'F4', 'H7', 'H14', 'I5', 'I17', 'J8', 'J12']

  const getShow = async () => {
    const show = dummyShowsData.find(show => show._id === id)
    if (show) {
      setShow({
        movie: show,
        dateTime: dummyDateTimeData
      })
    }
  }

  useEffect(() => {
    getShow()
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [id])

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast.error('Please select a time first', {
        icon: '⏰',
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333'
        }
      })
    }

    if (occupiedSeats.includes(seatId)) {
      return toast.error('This seat is already taken', {
        icon: '🚫',
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #ef4444'
        }
      })
    }

    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 8) {
      return toast.error('You can only select up to 8 seats', {
        icon: '👥',
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333'
        }
      })
    }

    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(seat => seat !== seatId) 
        : [...prev, seatId]
    )

    if (selectedSeats.includes(seatId)) {
      toast.success(`Seat ${seatId} deselected`, {
        icon: '↩️',
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #10b981'
        }
      })
    } else {
      toast.success(`Seat ${seatId} selected`, {
        icon: '✅',
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #10b981'
        }
      })
    }
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
    toast.success(`${isoTimeFormat(time.time)} selected`, {
      icon: '🎬',
      style: {
        background: '#1a1a1a',
        color: '#fff',
        border: '1px solid #6366f1'
      }
    })
  }

  const getSeatStatus = (seatId) => {
    if (occupiedSeats.includes(seatId)) return 'occupied'
    if (selectedSeats.includes(seatId)) return 'selected'
    return 'available'
  }

  const getSeatPrice = (row) => {
    const seatRow = seatRows.find(r => r.row === row)
    return seatRow?.price || 150
  }

  const getSeatStyles = (status, rowType) => {
    const baseStyles = 'w-8 h-8 rounded-lg border-2 text-xs font-bold transition-all duration-300 transform relative overflow-hidden'
    
    switch (status) {
      case 'selected':
        return `${baseStyles} bg-gradient-to-br from-primary to-primary-dull text-white border-primary shadow-lg shadow-primary/50 scale-110 animate-pulse`
      case 'occupied':
        return `${baseStyles} bg-gradient-to-br from-red-600 to-red-800 text-white border-red-500 cursor-not-allowed opacity-80`
      case 'available':
      default:
        const typeStyles = {
          front: 'border-yellow-500/40 hover:border-yellow-500 hover:bg-yellow-500/20 hover:text-yellow-500',
          middle: 'border-primary/40 hover:border-primary hover:bg-primary/20 hover:text-primary',
          back: 'border-green-500/40 hover:border-green-500 hover:bg-green-500/20 hover:text-green-500'
        }
        return `${baseStyles} bg-transparent text-gray-300 hover:text-white hover:scale-105 ${typeStyles[rowType] || typeStyles.middle}`
    }
  }

  const renderSeatRow = (rowData) => {
    const { row, count, type, price } = rowData
    const seats = []
    
    for (let i = 1; i <= count; i++) {
      const seatId = `${row}${i}`
      const status = getSeatStatus(seatId)
      
      // Add gaps based on seat configuration
      if (count === 9 && i === 5) {
        seats.push(
          <div key={`gap-${row}-1`} className="w-10"></div>
        )
      } else if (count === 18) {
        if (i === 5) {
          seats.push(
            <div key={`gap-${row}-1`} className="w-8"></div>
          )
        } else if (i === 14) {
          seats.push(
            <div key={`gap-${row}-2`} className="w-16"></div>
          )
        }
      }
      
      seats.push(
        <div key={seatId} className="relative group">
          <button
            onClick={() => handleSeatClick(seatId)}
            disabled={status === 'occupied'}
            className={getSeatStyles(status, type)}
          >
            {/* Seat number */}
            <span className="relative z-10">{i}</span>
            
            {/* Glow effect for selected seats */}
            {status === 'selected' && (
              <div className="absolute inset-0 bg-primary/30 rounded-lg blur-sm animate-pulse"></div>
            )}
            
            {/* Hover tooltip */}
            {status !== 'occupied' && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
                ${price} • {seatId}
              </div>
            )}
          </button>
        </div>
      )
    }

    return (
      <div key={row} className="flex items-center justify-center gap-2 mb-4 group">
        <span className="w-8 text-center text-gray-400 text-sm font-bold">{row}</span>
        <div className="flex items-center gap-2">
          {seats}
        </div>
        <span className="w-8 text-center text-gray-400 text-sm font-bold">{row}</span>
      </div>
    )
  }

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => {
      const row = seatId.charAt(0)
      const price = getSeatPrice(row)
      return total + price
    }, 0)
  }

  const getSectionColor = (type) => {
    switch (type) {
      case 'front': return 'text-yellow-500'
      case 'middle': return 'text-primary'
      case 'back': return 'text-green-500'
      default: return 'text-gray-400'
    }
  }

  return show ? (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5"></div>
      <BlurCircle top="-100px" left="-100px" />
      <BlurCircle bottom="-100px" right="-100px" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-3 h-3 bg-primary/60 rounded-full animate-bounce duration-[3000ms]"></div>
      <div className="absolute bottom-40 left-20 w-2 h-2 bg-yellow-500/40 rounded-full animate-ping duration-[4000ms] delay-1000"></div>
      <div className="absolute top-1/2 right-10 w-2 h-2 bg-green-500/50 rounded-full animate-pulse duration-[5000ms] delay-2000"></div>
      
      
      <div className="relative z-10 flex flex-col lg:flex-row gap-8 p-6 md:p-12 lg:p-16 xl:p-20">
        
        {/* Enhanced Left Sidebar */}
        <div className={`lg:w-96 transition-all duration-1000 ${
          isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
        }`}>
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 lg:sticky lg:top-20 shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <ClockIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Available Timings</h3>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-3 mb-8">
              {show.dateTime[date]?.map((item, index) => (
                <button
                  key={item.time}
                  onClick={() => handleTimeSelect(item)}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 group ${
                    selectedTime?.time === item.time
                      ? 'bg-gradient-to-r from-primary to-primary-dull text-white shadow-lg shadow-primary/30 scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-primary/30 hover:scale-102'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <ClockIcon className="w-5 h-5" />
                    <span className="font-bold text-lg">{isoTimeFormat(item.time)}</span>
                  </div>
                  {selectedTime?.time === item.time && (
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Enhanced Movie Info */}
            <div className="p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <img 
                  src={show.movie.poster_path} 
                  alt={show.movie.title}
                  className="w-16 h-24 rounded-lg object-cover border border-white/20"
                />
                <div className="flex-1">
                  <h4 className="text-white font-bold text-lg mb-2 line-clamp-2">{show.movie.title}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">{show.movie.vote_average.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>Cinema Hall 1</span>
                    </div>
                    <p className="text-gray-400">{timeFormat(show.movie.runtime)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="mt-6 space-y-3">
              <h5 className="text-white font-semibold mb-3">Seat Pricing</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-yellow-500">Front Premium</span>
                  <span className="text-white font-bold">$120</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-primary">Middle VIP</span>
                  <span className="text-white font-bold">$150</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-500">Back Standard</span>
                  <span className="text-white font-bold">$100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Right Section */}
        <div className={`flex-1 transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent">
              Select Your Seat
            </h1>
            <p className="text-gray-400 text-lg">Choose your preferred seats for the best cinema experience</p>
          </div>

          {/* Enhanced Screen */}
          <div className="flex flex-col items-center mb-16">
            <div className="relative mb-6">
              <div className="w-[500px] h-3 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-lg shadow-primary/30"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full blur-lg"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-transparent via-primary/10 to-transparent rounded-full blur-2xl"></div>
            </div>
            <p className="text-gray-400 text-sm font-bold tracking-wider">SCREEN</p>
          </div>

          {/* Enhanced Seat Map */}
          <div className="max-w-7xl mx-auto">
            {/* Front Section */}
            <div className="mb-12">
              <div className="text-center mb-6">
                <span className="text-yellow-500 text-lg font-bold px-4 py-2 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                  Front Premium • $120
                </span>
              </div>
              {seatRows.filter(row => row.type === 'front').map(renderSeatRow)}
            </div>

            {/* Middle Section */}
            <div className="mb-12">
              <div className="text-center mb-6">
                <span className="text-primary text-lg font-bold px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                  Middle VIP • $150
                </span>
              </div>
              {seatRows.filter(row => row.type === 'middle').map(renderSeatRow)}
            </div>

            {/* Back Section */}
            <div className="mb-12">
              <div className="text-center mb-6">
                <span className="text-green-500 text-lg font-bold px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                  Back Standard • $100
                </span>
              </div>
              {seatRows.filter(row => row.type === 'back').map(renderSeatRow)}
            </div>
          </div>

          {/* Enhanced Legend */}
          <div className="flex justify-center gap-12 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-transparent border-2 border-gray-600 rounded-lg"></div>
              <span className="text-gray-400 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary-dull rounded-lg shadow-lg shadow-primary/30"></div>
              <span className="text-gray-400 font-medium">Selected</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-br from-red-600 to-red-800 rounded-lg"></div>
              <span className="text-gray-400 font-medium">Occupied</span>
            </div>
          </div>

          {/* Enhanced Summary & Checkout */}
          {selectedSeats.length > 0 && (
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">
                      {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
                    </h3>
                    <p className="text-gray-400 text-sm">Ready for checkout</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                  <p className="text-3xl font-bold text-white">${calculateTotal()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="text-gray-400 font-medium">Selected Seats:</span>
                <div className="flex gap-2 flex-wrap">
                  {selectedSeats.map(seat => (
                    <span key={seat} className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm font-bold border border-primary/30">
                      {seat}
                    </span>
                  ))}
                </div>
              </div>

              <button 
                disabled={!selectedTime || selectedSeats.length === 0}
                onClick={() => navigate('/my-bookings')}
                className="w-full bg-gradient-to-r from-primary to-primary-dull hover:from-primary-dull hover:to-primary disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-6 rounded-2xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 shadow-lg shadow-primary/30 hover:shadow-2xl hover:shadow-primary/50 disabled:shadow-none flex items-center justify-center gap-3 text-lg relative overflow-hidden group"
              >
                <span className="relative z-10">Proceed to Checkout</span>
                <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default SeatLayout
