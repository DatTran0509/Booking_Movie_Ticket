import React, { useEffect, useState } from 'react'
import { assets, dummyBookingData } from '../assets/assets'
import Loading from '../components/Loading'
import BlurCircle from '../components/BlurCircle'
import timeFormat from '../lib/timeFormat'
import { Calendar, Clock, MapPin, Users, CreditCard, Ticket, Star, ArrowRight } from 'lucide-react'
import { useAppContext } from '../context/AppContext'
const MyBookings = () => {
  const {shows, axios, getToken, user, image_base_url, fetchFavoriteMovies,favoriteMovies} = useAppContext()
  
  const currency = '$'
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  const getMyBookings = async () => {
    try {
      const {data} = await axios.get('/api/user/bookings', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setBookings(data.bookings)
        setIsVisible(true)
      }
      else {
        console.error(data.message)
      }
      
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (user) {
      getMyBookings()
    }
  }, [user])

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime)
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    }
  }

  const getBookingStatus = (isPaid) => {
    return isPaid ? 'Confirmed' : 'Pending Payment'
  }

  const getStatusColor = (isPaid) => {
    return isPaid 
      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  }

  return !isLoading ? (
    <div className='min-h-screen bg-black relative overflow-hidden'>
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5"></div>
      <BlurCircle top='100px' left='100px'/>
      <BlurCircle top='0px' left='600px'/>
      <BlurCircle bottom='-100px' right='-100px'/>
      
      {/* Floating Particles */}
      <div className='absolute top-20 right-20 w-2 h-2 bg-primary/60 rounded-full animate-bounce duration-[3000ms]'></div>
      <div className='absolute bottom-40 left-20 w-1 h-1 bg-white/40 rounded-full animate-ping duration-[4000ms] delay-1000'></div>
      <div className='absolute top-1/2 right-10 w-1.5 h-1.5 bg-primary/50 rounded-full animate-pulse duration-[5000ms] delay-2000'></div>

      <div className='relative z-10 px-6 md:px-12 lg:px-16 xl:px-20 py-20'>
        {/* Header Section */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className='text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white via-primary to-white bg-clip-text text-transparent'>
            My Bookings
          </h1>
          <p className='text-gray-400 text-lg'>Your cinema reservations and booking history</p>
          <div className='w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-6 rounded-full'></div>
        </div>

        {/* Bookings List */}
        <div className='max-w-4xl mx-auto space-y-6'>
          {bookings.map((item, index) => {
            const dateTime = formatDateTime(item.show.movie.showDateTime)
            
            return (
              <div 
                key={index}
                className={`
                  group bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl 
                  rounded-3xl border border-white/10 p-6 md:p-8 
                  hover:border-primary/30 hover:bg-white/10 
                  transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10
                  ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
                `}
                style={{
                  animationDelay: `${index * 200}ms`
                }}
              >
                <div className='flex flex-col lg:flex-row gap-6 items-start'>
                  {/* Movie Poster & Info */}
                  <div className='flex gap-6 flex-1'>
                    <div className='relative group/poster flex-shrink-0'>
                      <div className='absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500'></div>
                      <div className='relative overflow-hidden rounded-2xl border-2 border-white/10 group-hover/poster:border-primary/30 transition-all duration-500'>
                        <img 
                          src={image_base_url+item.show.movie.poster_path} 
                          className='w-24 md:w-32 h-36 md:h-48 object-cover group-hover/poster:scale-105 transition-transform duration-500' 
                          alt={item.show.movie.title}
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity duration-500'></div>
                      </div>
                    </div>

                    <div className='flex-1 space-y-4'>
                      {/* Title & Rating */}
                      <div>
                        <h2 className='text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors duration-300'>
                          {item.show.movie.title}
                        </h2>
                        <div className='flex items-center gap-4 text-sm text-gray-400'>
                          <div className='flex items-center gap-1'>
                            <Star className='w-4 h-4 text-yellow-500 fill-current' />
                            <span>{item.show.movie.vote_average?.toFixed(1) || '8.5'}</span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <Clock className='w-4 h-4 text-primary' />
                            <span>{timeFormat(item.show.movie.runtime)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className='flex flex-wrap items-center gap-4 text-gray-300'>
                        <div className='flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10'>
                          <Calendar className='w-4 h-4 text-primary' />
                          <span className='text-sm font-medium'>{dateTime.date}</span>
                        </div>
                        <div className='flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10'>
                          <Clock className='w-4 h-4 text-primary' />
                          <span className='text-sm font-medium'>{dateTime.time}</span>
                        </div>
                        <div className='flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10'>
                          <MapPin className='w-4 h-4 text-primary' />
                          <span className='text-sm font-medium'>Cinema Hall 1</span>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2 text-gray-400'>
                            <Users className='w-4 h-4 text-primary' />
                            <span className='text-sm'>Total Tickets: </span>
                            <span className='text-white font-semibold'>{item.bookedSeats.length}</span>
                          </div>
                          <div className='flex items-center gap-2 text-gray-400'>
                            <Ticket className='w-4 h-4 text-primary' />
                            <span className='text-sm'>Seats: </span>
                            <div className='flex gap-1'>
                              {item.bookedSeats.map((seat, i) => (
                                <span key={i} className='px-2 py-1 bg-primary/20 text-primary text-xs rounded-lg font-medium border border-primary/30'>
                                  {seat}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price & Payment Section */}
                  <div className='flex flex-col items-end gap-4 min-w-fit'>
                    {/* Status Badge */}
                    <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(item.isPaid)}`}>
                      {getBookingStatus(item.isPaid)}
                    </div>

                    {/* Price */}
                    <div className='text-right'>
                      <p className='text-3xl font-bold text-white'>{currency}{item.amount}</p>
                      <p className='text-gray-400 text-sm'>Total Amount</p>
                    </div>

                    {/* Payment Button */}
                    {!item.isPaid && (
                      <button className='group/btn flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dull hover:from-primary-dull hover:to-primary text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/30 hover:shadow-primary/50 relative overflow-hidden'>
                        <CreditCard className='w-5 h-5' />
                        <span className='relative z-10'>Pay Now</span>
                        <ArrowRight className='w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300' />
                        <div className='absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-0 transition-transform duration-500'></div>
                      </button>
                    )}

                    {item.isPaid && (
                      <div className='flex items-center gap-2 text-green-400'>
                        <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse'></div>
                        <span className='text-sm font-medium'>Payment Confirmed</span>
                      </div>
                    )}
                  </div>
                </div>

               
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {bookings.length === 0 && (
          <div className='text-center py-20'>
            <div className='w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6'>
              <Ticket className='w-12 h-12 text-gray-600' />
            </div>
            <h3 className='text-2xl font-bold text-white mb-2'>No Bookings Found</h3>
            <p className='text-gray-400'>You have no bookings at the moment.</p>
          </div>
        )}
      </div>
    </div>
  ) : <Loading />
}

export default MyBookings
