import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { assets, dummyDateTimeData, dummyShowsData } from '../assets/assets'
import Loading from '../components/Loading'
import { ClockIcon, ArrowRight, Users, Calendar, Star, MapPin, ArrowLeft } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import toast from 'react-hot-toast'
import timeFormat from '../lib/timeFormat'
import { useAppContext } from '../context/AppContext'

// ✅ Thêm custom CSS animation ở đầu component
const customStyles = `
  @keyframes syncPulse {
    0%, 100% { 
      opacity: 1; 
      transform: scale(1.1);
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
    }
    50% { 
      opacity: 0.6; 
      transform: scale(1.05);
      box-shadow: 0 0 30px rgba(34, 197, 94, 0.8);
    }
  }
  
  @keyframes syncGlow {
    0%, 100% { 
      opacity: 0.4;
      transform: scale(1);
    }
    50% { 
      opacity: 0.8;
      transform: scale(1.1);
    }
  }
  
  .sync-pulse {
    animation: syncPulse 2s ease-in-out infinite;
  }
  
  .sync-glow {
    animation: syncGlow 2s ease-in-out infinite;
  }
`

const SeatLayout = () => {
  const { axios, getToken, user, image_base_url } = useAppContext()
  const { id, date } = useParams()
  const navigate = useNavigate()

  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedHall, setSelectedHall] = useState('') // ✅ Add hall selection state
  const [show, setShow] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [occupiedSeats, setOccupiedSeats] = useState([])
  const [showPrice, setShowPrice] = useState(0)
  const [priceLoading, setPriceLoading] = useState(false)

  // Seat configuration với pricing tiers
  const seatRows = [
    { row: 'A', count: 9, type: 'front', label: 'Front Premium' },
    { row: 'B', count: 9, type: 'front', label: 'Front Premium' },
    { row: 'C', count: 18, type: 'middle', label: 'Middle VIP' },
    { row: 'D', count: 18, type: 'middle', label: 'Middle VIP' },
    { row: 'E', count: 18, type: 'middle', label: 'Middle VIP' },
    { row: 'F', count: 18, type: 'middle', label: 'Middle VIP' },
    { row: 'G', count: 18, type: 'middle', label: 'Middle VIP' },
    { row: 'H', count: 18, type: 'back', label: 'Back Standard' },
    { row: 'I', count: 18, type: 'back', label: 'Back Standard' },
    { row: 'J', count: 18, type: 'back', label: 'Back Standard' }
  ]

  // Mock occupied seats
  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`)
      if (data.success) {
        setShow(data)
      }

    } catch (error) {
      console.log(error)
    }
  }
  const getOccupiedSeats = async () => {
    try {
      const { data } = await axios.get(`/api/booking/seats/${selectedTime.showId}`)
      if (data.success) {
        setOccupiedSeats(data.occupiedSeats)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
    }
  }
  const getShowPrice = async () => {
    try {
      if (!selectedTime?.showId) return;

      const { data } = await axios.get(`/api/show/showprice/${selectedTime.showId}`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })

      if (data.success) {
        setShowPrice(data.showPrice)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Error fetching show price:', error)
      toast.error('Failed to fetch show price')
    }
  }

  const bookTickets = async () => {
    try {
      if (!user) return toast.error('Please login to book tickets')
      const { data } = await axios.post('/api/booking/create', { showId: selectedTime.showId, selectedSeats: selectedSeats }, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        window.location.href = data.url

      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    getShow()
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [id])
  // ✅ Update useEffect to fetch price when time selected
  useEffect(() => {
    if (selectedTime) {
      getOccupiedSeats()
      getShowPrice() // ✅ Fetch price when time is selected
    }
  }, [selectedTime])

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

    if (showPrice === 0) {
      return toast.error('Loading seat price, please wait...', {
        icon: '💰',
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
      toast.success(`Seat ${seatId} selected • $${showPrice}`, {
        icon: '✅',
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #10b981'
        }
      })
    }
  }

  // ✅ Add function to get unique halls from show data
  const getAvailableHalls = () => {
    if (!show?.dateTime?.[date]) return []
    const halls = new Set()
    show.dateTime[date].forEach(item => {
      halls.add(item.hall)
    })

    return Array.from(halls).sort()
  }

  // ✅ Add function to get filtered times based on selected hall
  const getFilteredTimes = () => {
    if (!show?.dateTime?.[date]) return []

    if (!selectedHall) return show.dateTime[date]

    return show.dateTime[date].filter(item => item.hall === selectedHall)
  }

  // ✅ Add hall selection handler
  const handleHallSelect = (hall) => {
    setSelectedHall(hall)
    setSelectedTime(null) // Reset time selection when hall changes
    setSelectedSeats([]) // Reset seats when hall changes
    setShowPrice(0)

    toast.success(`${hall} selected`, {
      icon: '🏟️',
      style: {
        background: '#1a1a1a',
        color: '#fff',
        border: '1px solid #6366f1'
      }
    })
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
    toast.success(`${isoTimeFormat(time.time)} - ${time.hall} selected`, {
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
    return showPrice || 0 // Tất cả seats cùng giá showPrice
  }

  // ✅ Update getSeatStyles - remove animate-pulse, sẽ dùng custom class
  const getSeatStyles = (status, rowType) => {
    const baseStyles = 'w-8 h-8 rounded-lg border-2 text-xs font-bold transition-all duration-300 transform relative overflow-hidden'

    switch (status) {
      case 'selected':
        // ✅ Thêm sync-pulse class thay vì animate-pulse
        return `${baseStyles} bg-gradient-to-br from-green-500 to-green-600 text-white border-green-400 shadow-lg shadow-green-500/50 sync-pulse`
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

  // ✅ Update renderSeatRow với sync animation
  const renderSeatRow = (rowData) => {
    const { row, count, type } = rowData // Remove price from destructuring
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
            disabled={status === 'occupied' || showPrice === 0} // ✅ Disable until price loaded
            className={getSeatStyles(status, type)}
          >
            {/* Seat number */}
            <span className="relative z-10">{i}</span>

            {/* ✅ Sync glow effects */}
            {status === 'selected' && (
              <>
                <div className="absolute inset-0 bg-green-500/40 rounded-lg blur-sm sync-glow"></div>
                <div className="absolute -inset-1 bg-green-400/20 rounded-lg blur-md sync-glow"></div>
                <div className="absolute -inset-2 bg-green-300/10 rounded-lg blur-xl sync-glow"></div>
              </>
            )}

            {/* ✅ Updated tooltip với showPrice */}
            {status !== 'occupied' && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20">
                ${showPrice > 0 ? showPrice : '...'} • {seatId}
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
    return selectedSeats.length * showPrice
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
      {/* ✅ Inject custom styles */}
      <style>{customStyles}</style>

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
        <div className={`lg:w-96 transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
          }`}>
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 lg:sticky lg:top-20 shadow-2xl">
            
            {/* ✅ Step 1: Date Selection Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Selected Date</h3>
                <p className="text-primary text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* ✅ Step 2: Hall Selection (Second) */}
            <div className="mb-8">
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Step 1: Select Cinema Hall
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {getAvailableHalls().map((hall, index) => (
                  <button
                    key={hall}
                    onClick={() => handleHallSelect(hall)}
                    className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                      selectedHall === hall
                        ? 'border-primary bg-primary/10 text-white shadow-lg shadow-primary/20'
                        : 'border-gray-600/50 bg-gray-700/20 text-gray-300 hover:border-primary/50 hover:bg-primary/5'
                    }`}
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4" />
                        <div>
                          <h5 className="font-semibold">{hall}</h5>
                          <p className="text-sm opacity-70">
                            {show.dateTime[date].filter(item => item.hall === hall).length} shows available
                          </p>
                        </div>
                      </div>
                      {selectedHall === hall && (
                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Progress indicator */}
              {selectedHall && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Hall selected: {selectedHall}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ✅ Step 3: Time Selection (Third) */}
            <div className="mb-8">
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-primary" />
                Step 2: Select Show Time
                {selectedHall && <span className="text-primary text-sm">({selectedHall})</span>}
              </h4>

              {!selectedHall ? (
                <div className="text-center py-8 bg-gray-700/20 rounded-xl border border-gray-600/30">
                  <ClockIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Please select a hall first</p>
                  <p className="text-sm text-gray-500">
                    Step 1: Choose from {getAvailableHalls().length} available halls above
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredTimes().map((item, index) => (
                    <button
                      key={`${item.time}-${item.hall}`}
                      onClick={() => handleTimeSelect(item)}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 group ${
                        selectedTime?.showId === item.showId
                          ? 'bg-gradient-to-r from-primary to-primary-dull text-white shadow-lg shadow-primary/30 scale-105'
                          : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-primary/30 hover:scale-102'
                      }`}
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <ClockIcon className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-bold text-lg">{isoTimeFormat(item.time)}</div>
                
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">${item.price}</div>
                        {selectedTime?.showId === item.showId && (
                          <div className="w-3 h-3 bg-white rounded-full animate-pulse mt-1 ml-auto"></div>
                        )}
                      </div>
                    </button>
                  ))}

                  {getFilteredTimes().length === 0 && (
                    <div className="text-center py-8">
                      <ClockIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No shows available for {selectedHall}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Progress indicator */}
              {selectedTime && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Show time selected: {isoTimeFormat(selectedTime.time)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Movie Info */}
            <div className="p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <img
                  src={image_base_url + show.movie.poster_path}
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
                    
                    {/* ✅ Show progress steps */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-primary font-medium">
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 ${selectedHall ? 'text-green-400' : 'text-gray-400'}`} />
                        <span className={selectedHall ? 'text-green-400 font-medium' : 'text-gray-400'}>
                          {selectedHall || 'Select hall'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ClockIcon className={`w-4 h-4 ${selectedTime ? 'text-green-400' : 'text-gray-400'}`} />
                        <span className={selectedTime ? 'text-green-400 font-medium' : 'text-gray-400'}>
                          {selectedTime ? isoTimeFormat(selectedTime.time) : 'Select time'}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-400">{timeFormat(show.movie.runtime)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Enhanced Pricing Info */}
            <div className="mt-6 space-y-3">
              <h5 className="text-white font-semibold mb-3">Seat Pricing</h5>
              <div className="space-y-2 text-sm">
                {selectedTime ? (
                  <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="text-primary text-2xl font-bold mb-1">
                      {priceLoading ? (
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                      ) : (
                        `$${showPrice}`
                      )}
                    </div>
                    <div className="text-gray-400 text-sm">
                      All Seats • {selectedTime.hall}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full mx-auto mb-2 animate-spin"></div>
                    <span className="text-gray-400 text-sm">
                      {!selectedHall ? 'Step 1: Choose Hall' : 'Step 2: Choose Show Time'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Right Section */}
        <div className={`flex-1 transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent">
              Select Your Seat
            </h1>
            <p className="text-gray-400 text-lg">Choose your preferred seats for the best cinema experience</p>
            
            {/* ✅ Progress indicator */}
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-primary text-sm font-medium">Date Selected</span>
                </div>
                
                <div className="w-px h-4 bg-gray-600"></div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${selectedHall ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                  <span className={`text-sm font-medium ${selectedHall ? 'text-green-400' : 'text-gray-400'}`}>
                    Hall {selectedHall ? '✓' : ''}
                  </span>
                </div>
                
                <div className="w-px h-4 bg-gray-600"></div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${selectedTime ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                  <span className={`text-sm font-medium ${selectedTime ? 'text-green-400' : 'text-gray-400'}`}>
                    Time {selectedTime ? '✓' : ''}
                  </span>
                </div>
                
                <div className="w-px h-4 bg-gray-600"></div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${selectedSeats.length > 0 ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                  <span className={`text-sm font-medium ${selectedSeats.length > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                    Seats {selectedSeats.length > 0 ? `(${selectedSeats.length})` : ''}
                  </span>
                </div>
              </div>
            </div>
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
                  Front Premium • ${showPrice > 0 ? showPrice : '...'}
                </span>
              </div>
              {seatRows.filter(row => row.type === 'front').map(renderSeatRow)}
            </div>

            {/* Middle Section */}
            <div className="mb-12">
              <div className="text-center mb-6">
                <span className="text-primary text-lg font-bold px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                  Middle VIP • ${showPrice > 0 ? showPrice : '...'}
                </span>
              </div>
              {seatRows.filter(row => row.type === 'middle').map(renderSeatRow)}
            </div>

            {/* Back Section */}
            <div className="mb-12">
              <div className="text-center mb-6">
                <span className="text-green-500 text-lg font-bold px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                  Back Standard • ${showPrice > 0 ? showPrice : '...'}
                </span>
              </div>
              {seatRows.filter(row => row.type === 'back').map(renderSeatRow)}
            </div>
          </div>

          {/* Enhanced Legend với sync animation */}
          <div className="flex justify-center gap-12 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-transparent border-2 border-gray-600 rounded-lg"></div>
              <span className="text-gray-400 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-3">
              {/* ✅ Sync animation cho legend */}
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg shadow-green-500/30 sync-pulse"></div>
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
                    /* ✅ Sync animation cho selected seat tags */
                    <span key={seat} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold border border-green-500/30 sync-pulse">
                      {seat}
                    </span>
                  ))}
                </div>
              </div>

              <button
                disabled={!selectedTime || selectedSeats.length === 0}
                onClick={bookTickets}
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
