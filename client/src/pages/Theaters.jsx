import React, { useState, useEffect } from 'react'
import { MapPin, Users, Star, Eye, Monitor, Volume2, Wifi, Snowflake, Car, Coffee } from 'lucide-react'
import BlurCircle from '../components/BlurCircle'
import { useNavigate } from 'react-router-dom'
const Theaters = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedHall, setSelectedHall] = useState('Hall 1')

  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

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

  const halls = [
    {
      name: 'Hall 1',
      type: 'Premium IMAX',
      capacity: 162,
      screenSize: '22m x 16m',
      audioSystem: 'Dolby Atmos',
      features: ['IMAX', '4K Projection', 'Dolby Atmos', 'Premium Seating']
    },
    {
      name: 'Hall 2',
      type: 'VIP Lounge',
      capacity: 162,
      screenSize: '18m x 12m',
      audioSystem: 'DTS:X',
      features: ['VIP Seating', '4K HDR', 'DTS:X Audio', 'Food Service']
    },
    {
      name: 'Hall 3',
      type: 'Standard Plus',
      capacity: 162,
      screenSize: '16m x 10m',
      audioSystem: 'Dolby Digital',
      features: ['Digital Projection', 'Surround Sound', 'Climate Control']
    },
    {
      name: 'Hall 4',
      type: 'Family Theater',
      capacity: 162,
      screenSize: '16m x 10m',
      audioSystem: 'Dolby Digital',
      features: ['Family Friendly', 'Comfortable Seating', 'Accessible']
    },
    {
      name: 'Hall 5',
      type: 'Premium Theater',
      capacity: 162,
      screenSize: '20m x 14m',
      audioSystem: 'Dolby Atmos',
      features: ['Premium Experience', '4K Laser', 'Dolby Atmos']
    }
  ]

  const amenities = [
    { icon: Monitor, name: '4K Digital Projection', description: 'Crystal clear picture quality' },
    { icon: Volume2, name: 'Dolby Atmos Sound', description: 'Immersive audio experience' },
    { icon: Snowflake, name: 'Climate Control', description: 'Perfect temperature always' },
    { icon: Wifi, name: 'Free WiFi', description: 'Stay connected during breaks' },
    { icon: Car, name: 'Free Parking', description: '200+ parking spaces' },
    { icon: Coffee, name: 'Concession Stand', description: 'Snacks and beverages' }
  ]

  const getSeatTypeInfo = (type) => {
    switch (type) {
      case 'front':
        return { color: 'bg-yellow-500', label: 'Front Premium' }
      case 'middle':
        return { color: 'bg-primary', label: 'Middle VIP' }
      case 'back':
        return { color: 'bg-green-500', label: 'Back Standard' }
      default:
        return { color: 'bg-gray-500', label: 'Standard' }
    }
  }

  // ✅ Improved seat rendering with better layout like SeatLayout
  const renderSeatRow = (rowData, index) => {
    const { color } = getSeatTypeInfo(rowData.type)
    const seats = []

    // Create seats with proper spacing and grouping
    for (let i = 1; i <= rowData.count; i++) {
      const seatNumber = `${rowData.row}${i}`

      // Add spacing every 3 seats for smaller rows, every 6 seats for larger rows
      const needsSpacing = rowData.count > 12 ? i % 6 === 0 && i !== rowData.count : i % 3 === 0 && i !== rowData.count

      seats.push(
        <React.Fragment key={seatNumber}>
          <div
            className={`w-5 h-5 ${color} rounded-lg opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-200 cursor-pointer shadow-sm border border-white/20`}
            title={seatNumber}
          />
          {needsSpacing && <div className="w-4"></div>}
        </React.Fragment>
      )
    }

    return (
      <div
        key={rowData.row}
        className={`flex items-center justify-center gap-2 mb-3 transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {/* Row label */}
        <div className="w-8 flex justify-center">
          <span className="text-gray-400 font-bold text-lg font-mono">{rowData.row}</span>
        </div>

        {/* Seats with proper centering */}
        <div className="flex items-center justify-center gap-1.5 min-w-0">
          {seats}
        </div>

        {/* Row label on right */}
        <div className="w-8 flex justify-center">
          <span className="text-gray-400 font-bold text-lg font-mono">{rowData.row}</span>
        </div>
      </div>
    )
  }

  const currentHallData = halls.find(hall => hall.name === selectedHall)
  const totalSeats = seatRows.reduce((sum, row) => sum + row.count, 0)

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5"></div>
      <BlurCircle top="-100px" left="-100px" />
      <BlurCircle bottom="-100px" right="-100px" />

      {/* Animated particles */}
      <div className="absolute top-20 right-20 w-3 h-3 bg-primary/60 rounded-full animate-bounce duration-[3000ms]"></div>
      <div className="absolute bottom-40 left-20 w-2 h-2 bg-yellow-500/40 rounded-full animate-ping duration-[4000ms] delay-1000"></div>
      <div className="absolute top-1/2 right-10 w-2 h-2 bg-green-500/50 rounded-full animate-pulse duration-[5000ms] delay-2000"></div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
          }`}>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent">
            Our Theaters
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Experience cinema like never before in our state-of-the-art theaters.
            Each hall is designed for the ultimate movie experience with premium comfort and cutting-edge technology.
          </p>
        </div>

        {/* Theater Stats */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-3xl font-bold text-primary mb-2">5</div>
            <div className="text-gray-400">Theater Halls</div>
          </div>
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-3xl font-bold text-primary mb-2">{totalSeats}</div>
            <div className="text-gray-400">Total Seats</div>
          </div>
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-3xl font-bold text-primary mb-2">4K</div>
            <div className="text-gray-400">Digital Quality</div>
          </div>
          <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-3xl font-bold text-primary mb-2">100%</div>
            <div className="text-gray-400">Comfort Rating</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Hall Selection */}
          <div className={`lg:col-span-1 transition-all duration-1000 delay-500 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 sticky top-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-primary" />
                Select Theater Hall
              </h2>

              <div className="space-y-3 mb-8">
                {halls.map((hall, index) => (
                  <button
                    key={hall.name}
                    onClick={() => setSelectedHall(hall.name)}
                    className={`w-full p-4 rounded-xl border transition-all duration-300 text-left ${selectedHall === hall.name
                        ? 'border-primary bg-primary/10 text-white shadow-lg shadow-primary/20'
                        : 'border-gray-600/50 bg-gray-700/20 text-gray-300 hover:border-primary/50 hover:bg-primary/5'
                      }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg">{hall.name}</h3>
                      {selectedHall === hall.name && (
                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <p className="text-sm opacity-70 mb-1">{hall.type}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {hall.capacity} seats
                      </span>
                      <span className="flex items-center gap-1">
                        <Monitor className="w-3 h-3" />
                        {hall.screenSize}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Current Hall Info */}
              {currentHallData && (
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl p-6 border border-primary/20">
                  <h3 className="text-lg font-bold text-white mb-3">{currentHallData.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-primary font-medium">{currentHallData.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Capacity:</span>
                      <span className="text-white">{currentHallData.capacity} seats</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Screen:</span>
                      <span className="text-white">{currentHallData.screenSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Audio:</span>
                      <span className="text-white">{currentHallData.audioSystem}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-gray-400 text-xs mb-2">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {currentHallData.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-lg border border-primary/30"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ✅ Improved Theater Layout */}
          <div className={`lg:col-span-2 transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 text-white">
                  {currentHallData?.name} Layout
                </h2>
                <p className="text-gray-400">Interactive seat map - {totalSeats} total seats</p>
              </div>

              {/* ✅ Enhanced Screen */}
              <div className="flex flex-col items-center mb-12">
                <div className="relative mb-6">
                  <div className="w-[500px] h-4 bg-gradient-to-r from-transparent via-primary via-white via-primary to-transparent rounded-full shadow-2xl shadow-primary/40"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full blur-lg"></div>
                  <div className="absolute -inset-3 bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full blur-2xl"></div>
                </div>
                <p className="text-gray-400 text-sm font-bold tracking-[0.2em]">CINEMA SCREEN</p>
              </div>

              {/* ✅ Improved Seat Layout with better spacing */}
              <div className="max-w-5xl mx-auto">
                {/* Front Premium */}
                <div className="mb-10">
                  <div className="text-center mb-6">
                    <span className="text-yellow-500 text-sm font-bold px-6 py-3 bg-yellow-500/15 rounded-2xl border border-yellow-500/30 backdrop-blur-sm">
                      FRONT PREMIUM SECTION
                    </span>
                  </div>
                  <div className="space-y-4 bg-yellow-500/5 rounded-2xl p-6 border border-yellow-500/20">
                    {seatRows.filter(row => row.type === 'front').map((row, index) => renderSeatRow(row, index))}
                  </div>
                </div>

                {/* Walkway */}
                <div className="h-8 border-b border-dashed border-gray-600/30 mb-10 relative">
                  <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black px-4 py-1 text-gray-500 text-xs rounded-full">
                    WALKWAY
                  </span>
                </div>

                {/* Middle VIP */}
                <div className="mb-10">
                  <div className="text-center mb-6">
                    <span className="text-primary text-sm font-bold px-6 py-3 bg-primary/15 rounded-2xl border border-primary/30 backdrop-blur-sm">
                      MIDDLE VIP SECTION
                    </span>
                  </div>
                  <div className="space-y-4 bg-primary/5 rounded-2xl p-6 border border-primary/20">
                    {seatRows.filter(row => row.type === 'middle').map((row, index) => renderSeatRow(row, index + 2))}
                  </div>
                </div>

                {/* Walkway */}
                <div className="h-8 border-b border-dashed border-gray-600/30 mb-10 relative">
                  <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black px-4 py-1 text-gray-500 text-xs rounded-full">
                    WALKWAY
                  </span>
                </div>

                {/* Back Standard */}
                <div className="mb-8">
                  <div className="text-center mb-6">
                    <span className="text-green-500 text-sm font-bold px-6 py-3 bg-green-500/15 rounded-2xl border border-green-500/30 backdrop-blur-sm">
                      BACK STANDARD SECTION
                    </span>
                  </div>
                  <div className="space-y-4 bg-green-500/5 rounded-2xl p-6 border border-green-500/20">
                    {seatRows.filter(row => row.type === 'back').map((row, index) => renderSeatRow(row, index + 7))}
                  </div>
                </div>
              </div>

              {/* ✅ Enhanced Legend */}
              <div className="flex justify-center gap-8 mt-12 pt-6 border-t border-gray-700/30">
                <div className="flex items-center gap-3 bg-yellow-500/10 px-4 py-2 rounded-xl border border-yellow-500/20">
                  <div className="w-5 h-5 bg-yellow-500 rounded-lg shadow-sm"></div>
                  <span className="text-yellow-400 text-sm font-medium">Front Premium</span>
                </div>
                <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                  <div className="w-5 h-5 bg-primary rounded-lg shadow-sm"></div>
                  <span className="text-primary text-sm font-medium">Middle VIP</span>
                </div>
                <div className="flex items-center gap-3 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
                  <div className="w-5 h-5 bg-green-500 rounded-lg shadow-sm"></div>
                  <span className="text-green-400 text-sm font-medium">Back Standard</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className={`transition-all duration-1000 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-white">Premium Amenities</h2>
            <p className="text-gray-400 text-lg">Experience luxury and comfort in every detail</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {amenities.map((amenity, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                    <amenity.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{amenity.name}</h3>
                    <p className="text-gray-400 text-sm">{amenity.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-1100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
          <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl border border-primary/30 p-8 backdrop-blur-sm">
            <h3 className="text-3xl font-bold text-white mb-4">Ready for the Ultimate Cinema Experience?</h3>
            <p className="text-gray-300 text-lg mb-6">Book your tickets now and enjoy our premium theaters</p>
            <button
              onClick={() => {
                navigate('/movies')
                window.scrollTo(0, 0)
              }}
              className="bg-gradient-to-r from-primary to-primary-dull hover:from-primary-dull hover:to-primary text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/30"
            >
              Book Tickets Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Theaters