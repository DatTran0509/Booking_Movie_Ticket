import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import BlurCircle from '../../components/BlurCircle'
import { Calendar, Clock, Users, DollarSign, Star, Filter, ChevronDown } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'

const ListShows = () => {
    const {axios, getToken, user, image_base_url} = useAppContext()
    
    const currency = import.meta.env.VITE_CURRENCY || '$'
    const [shows, setShows] = useState([])
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()) // Current month
    const [selectedYear] = useState(new Date().getFullYear())

    // ✅ Get current and next month options
    const getMonthOptions = () => {
        const currentDate = new Date()
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        const currentMonth = currentDate.getMonth()
        const nextMonth = (currentMonth + 1) % 12
        const nextMonthYear = currentMonth === 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear()
        
        return [
            { value: currentMonth, label: `${months[currentMonth]} ${currentDate.getFullYear()}`, year: currentDate.getFullYear() },
            { value: nextMonth, label: `${months[nextMonth]} ${nextMonthYear}`, year: nextMonthYear }
        ]
    }

    const monthOptions = getMonthOptions()

    const getAllShows = async () => {
        try {
            // ✅ Get shows for current and next month only
            const {data} = await axios.get('/api/admin/shows-by-month', {
                headers: { Authorization: `Bearer ${await getToken()}` },
                params: { 
                    month: selectedMonth,
                    year: monthOptions.find(m => m.value === selectedMonth)?.year || selectedYear
                }
            })
            
            if (data.success) {
                setShows(data.shows)
            }
            else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error fetching shows:', error)
            toast.error('Failed to load shows')
        }
    }

    const getAllBookings = async () => {
        try {
            // ✅ Get bookings for selected month only
            const {data} = await axios.get('/api/admin/bookings-by-month', {
                headers: { Authorization: `Bearer ${await getToken()}` },
                params: { 
                    month: selectedMonth,
                    year: monthOptions.find(m => m.value === selectedMonth)?.year || selectedYear
                }
            })
            
            if (data.success) {
                setBookings(data.bookings)
                setLoading(false)
            }
            else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error fetching bookings:', error)
            toast.error('Failed to load bookings')
        }
    }

    useEffect(() => {
        if(user) {
            getAllShows()
            getAllBookings()
        }
    }, [user, selectedMonth])

    // ✅ Calculate total bookings for a specific show from backend data
    const getTotalBookings = (show) => {
        const showBookings = bookings.filter(booking => booking.show?._id === show._id)
        const totalSeats = showBookings.reduce((total, booking) => total + (booking.bookedSeats?.length || 0), 0)
        return totalSeats
    }

    // ✅ Calculate total earning for a specific show from backend data
    const getTotalEarning = (show) => {
        const showBookings = bookings.filter(booking => 
            booking.show?._id === show._id && booking.isPaid === true
        )
        const totalEarning = showBookings.reduce((total, booking) => total + (booking.amount || 0), 0)
        return totalEarning
    }

    // ✅ Calculate pending revenue for a specific show
    const getPendingRevenue = (show) => {
        const showBookings = bookings.filter(booking => 
            booking.show?._id === show._id && booking.isPaid === false
        )
        const pendingRevenue = showBookings.reduce((total, booking) => total + (booking.amount || 0), 0)
        return pendingRevenue
    }

    // ✅ Calculate total stats from backend data for selected month
    const getTotalStats = () => {
        const totalBookings = bookings.reduce((total, booking) => total + (booking.bookedSeats?.length || 0), 0)
        const totalRevenue = bookings
            .filter(booking => booking.isPaid)
            .reduce((total, booking) => total + (booking.amount || 0), 0)
        const pendingRevenue = bookings
            .filter(booking => !booking.isPaid)
            .reduce((total, booking) => total + (booking.amount || 0), 0)
        
        return { totalBookings, totalRevenue, pendingRevenue }
    }

    const { totalBookings: monthlyTotalBookings, totalRevenue: monthlyTotalRevenue, pendingRevenue: monthlyPendingRevenue } = getTotalStats()

    // ✅ Check if show is this month or next month
    const getShowStatus = (showDateTime) => {
        const showDate = new Date(showDateTime)
        const showMonth = showDate.getMonth()
        const currentMonth = new Date().getMonth()
        
        if (showMonth === currentMonth) {
            return { status: 'current', label: 'This Month', color: 'text-green-400 bg-green-500/20 border-green-500/30' }
        } else {
            return { status: 'next', label: 'Next Month', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' }
        }
    }

    return !loading ? (
        <div className="min-h-screen bg-black text-white p-6 relative">
            {/* Background Effects */}
            <BlurCircle top='-100px' left='0'/>
            <BlurCircle top='300px' right='100px'/>
            
            {/* Header */}
            <div className="mb-8">
                <Title text1='List' text2='Shows' />
                <p className="text-gray-400 mt-2">Manage movie shows for current and next month</p>
            </div>

            {/* ✅ Month Filter */}
            <div className="mb-6">
                <div className="flex items-center gap-4">
                    <Filter className="w-5 h-5 text-primary" />
                    <span className="text-white font-medium">Filter by Month:</span>
                    <div className="relative">
                        <select 
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-2 text-white text-sm appearance-none pr-8 focus:outline-none focus:border-primary/50"
                        >
                            {monthOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* ✅ Updated Stats Cards with monthly data */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Star className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-blue-400 font-semibold">Monthly Shows</p>
                            <p className="text-2xl font-bold text-white">{shows.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-green-400 font-semibold">Monthly Bookings</p>
                            <p className="text-2xl font-bold text-white">{monthlyTotalBookings}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-emerald-400 font-semibold">Paid Revenue</p>
                            <p className="text-2xl font-bold text-white">{currency}{monthlyTotalRevenue}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-yellow-400 font-semibold">Pending Revenue</p>
                            <p className="text-2xl font-bold text-white">{currency}{monthlyPendingRevenue}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shows Table */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="bg-gradient-to-r from-primary/20 to-primary/10 border-b border-gray-700/50">
                    <div className="grid grid-cols-12 gap-6 p-6 text-sm font-semibold text-gray-300 uppercase tracking-wide">
                        <div className="col-span-5 flex items-center gap-2">
                            <Star className="w-4 h-4 text-primary" />
                            Movie & Schedule
                        </div>
                        <div className="col-span-3 flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            Bookings
                        </div>
                        <div className="col-span-4 flex items-center gap-2 justify-center">
                            <DollarSign className="w-4 h-4 text-primary" />
                            Revenue Summary
                        </div>
                    </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-700/30">
                    {shows.map((show, index) => {
                        const showStatus = getShowStatus(show.showDateTime)
                        return (
                            <div 
                                key={show._id}
                                className="grid grid-cols-12 gap-6 p-6 hover:bg-white/5 transition-all duration-300 group"
                            >
                                {/* Movie & Schedule */}
                                <div className="col-span-5 flex items-center gap-4">
                                    <div className="relative flex-shrink-0">
                                        <img 
                                            src={show.movie?.poster_path ? `${image_base_url}${show.movie.poster_path}` : '/placeholder-movie.jpg'} 
                                            alt={show.movie?.title || 'Movie'}
                                            className="w-16 h-20 object-cover rounded-lg border border-gray-600 shadow-lg"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-movie.jpg'
                                            }}
                                        />
                                        {/* Rating badge */}
                                        <div className="absolute -top-1 -right-1 bg-yellow-500/90 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
                                            {show.movie?.vote_average?.toFixed(1) || '8.5'}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-white font-semibold group-hover:text-primary transition-colors truncate">
                                                {show.movie?.title || 'Unknown Movie'}
                                            </h3>
                                            {/* ✅ Month Status Badge */}
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${showStatus.color}`}>
                                                {showStatus.label}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm mt-1 truncate">
                                            {show.movie?.genres?.slice(0, 2).map(genre => genre.name).join(', ') || 'Unknown Genre'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-primary text-sm font-medium">
                                                {currency}{show.showPrice || 0}
                                            </span>
                                            <span className="text-gray-500 text-xs">per seat</span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>{show.showDateTime ? new Date(show.showDateTime).toLocaleDateString() : 'No date'}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{show.showDateTime ? new Date(show.showDateTime).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                }) : 'No time'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bookings */}
                                <div className="col-span-3 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl font-bold text-white">
                                            {getTotalBookings(show)}
                                        </span>
                                        <Users className="w-5 h-5 text-primary" />
                                    </div>
                                    <p className="text-gray-400 text-sm mb-2">Seats booked</p>
                                    
                                    {/* Progress bar */}
                                    <div className="w-full bg-gray-700/30 rounded-full h-2 mb-1">
                                        <div 
                                            className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min((getTotalBookings(show) / 100) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {Math.min((getTotalBookings(show) / 100) * 100, 100).toFixed(0)}% capacity
                                    </p>
                                </div>

                                {/* Revenue Summary */}
                                <div className="col-span-4 flex items-center justify-between gap-4">
                                    {/* Paid Revenue */}
                                    <div className="flex-1 text-center">
                                        <div className="text-xl font-bold text-green-400 mb-1">
                                            {currency}{getTotalEarning(show)}
                                        </div>
                                        <p className="text-gray-400 text-xs">Paid Revenue</p>
                                        <div className="flex items-center justify-center gap-1 mt-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-green-400 text-xs">Completed</span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-px h-12 bg-gray-600/50"></div>

                                    {/* Pending Revenue */}
                                    <div className="flex-1 text-center">
                                        <div className="text-xl font-bold text-yellow-400 mb-1">
                                            {currency}{getPendingRevenue(show)}
                                        </div>
                                        <p className="text-gray-400 text-xs">Pending</p>
                                        <div className="flex items-center justify-center gap-1 mt-1">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                            <span className="text-yellow-400 text-xs">Waiting</span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-px h-12 bg-gray-600/50"></div>

                                    {/* Total Potential */}
                                    <div className="flex-1 text-center">
                                        <div className="text-xl font-bold text-white mb-1">
                                            {currency}{getTotalEarning(show) + getPendingRevenue(show)}
                                        </div>
                                        <p className="text-gray-400 text-xs">Total</p>
                                        <div className="flex items-center justify-center gap-1 mt-1">
                                            <Star className="w-3 h-3 text-purple-400" />
                                            <span className="text-purple-400 text-xs">Potential</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Empty State */}
                {shows.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Shows Found</h3>
                        <p className="text-gray-400">
                            No shows scheduled for {monthOptions.find(m => m.value === selectedMonth)?.label}
                        </p>
                    </div>
                )}
            </div>
        </div>
    ) : <Loading />
}

export default ListShows