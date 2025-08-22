import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { dummyBookingData } from '../../assets/assets'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import BlurCircle from '../../components/BlurCircle'
import { dateFormat } from '../../lib/dateFormat'
import { User, Film, Calendar, MapPin, DollarSign, Eye, CheckCircle, Clock, CreditCard } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
const ListBookings = () => {
    const {axios, getToken, user, image_base_url} = useAppContext()
    
    const currency = import.meta.env.VITE_CURRENCY || '$'
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)

    const getAllBooking = async () => {
        try {
            const {data} = await axios.get('/api/admin/all-bookings', {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            console.log(data)
            if (data.success) {
                setBookings(data.bookings) 
                setLoading(false)
            }
            else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
        }
        
    }

    useEffect(() => {
        if (user) {
            getAllBooking()
        }
    }, [user])

    const getStatusBadge = (isPaid) => {
        if (isPaid) {
            return (
                <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
                    <CheckCircle className="w-3 h-3" />
                    <span>Paid</span>
                </div>
            )
        } else {
            return (
                <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm border border-yellow-500/30">
                    <Clock className="w-3 h-3" />
                    <span>Pending</span>
                </div>
            )
        }
    }

    // ✅ Chỉ tính doanh thu từ booking đã thanh toán
    const getTotalRevenue = () => {
        return bookings
            .filter(booking => booking.isPaid) // Chỉ lấy booking đã thanh toán
            .reduce((total, booking) => total + booking.amount, 0)
    }

    // ✅ Thêm hàm tính tổng doanh thu pending
    const getPendingRevenue = () => {
        return bookings
            .filter(booking => !booking.isPaid) // Chỉ lấy booking chưa thanh toán
            .reduce((total, booking) => total + booking.amount, 0)
    }

    const getPaidBookings = () => {
        return bookings.filter(booking => booking.isPaid).length
    }

    return !loading ? (
        <div className="min-h-screen bg-black text-white p-6 relative">
            {/* Background Effects */}
            <BlurCircle top='-100px' left='0'/>
            <BlurCircle top='300px' right='100px'/>
            
            {/* Header */}
            <div className="mb-8">
                <Title text1='List' text2='Bookings' />
                <p className="text-gray-400 mt-2">Manage all user bookings and transactions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Eye className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-blue-400 font-semibold text-sm">Total Bookings</p>
                            <p className="text-2xl font-bold text-white">{bookings.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-green-400 font-semibold text-sm">Paid Revenue</p>
                            <p className="text-2xl font-bold text-white">{currency}{getTotalRevenue()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-yellow-400 font-semibold text-sm">Pending Revenue</p>
                            <p className="text-2xl font-bold text-white">{currency}{getPendingRevenue()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-purple-400 font-semibold text-sm">Total Potential</p>
                            <p className="text-2xl font-bold text-white">{currency}{getTotalRevenue() + getPendingRevenue()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="bg-gradient-to-r from-primary/20 to-primary/10 border-b border-gray-700/50">
                    <div className="grid grid-cols-12 gap-4 p-6 text-sm font-semibold text-gray-300 uppercase tracking-wide">
                        <div className="col-span-2 flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            User Info
                        </div>
                        <div className="col-span-3 flex items-center gap-2">
                            <Film className="w-4 h-4 text-primary" />
                            Movie Details
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            Show Time
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            Seats
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-primary" />
                            Payment
                        </div>
                        <div className="col-span-1 text-center">Status</div>
                    </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-700/30">
                    {bookings.map((booking, index) => (
                        <div 
                            key={index}
                            className="grid grid-cols-12 gap-4 p-6 hover:bg-white/5 transition-all duration-300 group"
                        >
                            {/* User Info */}
                            <div className="col-span-2 flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-sm group-hover:text-primary transition-colors">
                                        {booking.user.name}
                                    </h3>
                                    <p className="text-gray-400 text-xs">ID: {booking._id?.slice(-6) || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Movie Details */}
                            <div className="col-span-3 flex items-center gap-3">
                                <div className="relative flex-shrink-0">
                                    <img 
                                        src={booking.show.movie.poster_path} 
                                        alt={booking.show.movie.title}
                                        className="w-12 h-16 object-cover rounded-lg border border-gray-600"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-sm group-hover:text-primary transition-colors">
                                        {booking.show.movie.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-yellow-500 text-xs">
                                            ⭐ {booking.show.movie.vote_average?.toFixed(1) || '8.5'}
                                        </span>
                                        <span className="text-gray-400 text-xs">
                                            {booking.show.movie.runtime || '120'} min
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Show Time */}
                            <div className="col-span-2 flex flex-col justify-center">
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="font-medium text-sm">{dateFormat(booking.show.showDateTime)}</span>
                                </div>
                                <p className="text-gray-400 text-xs mt-1">
                                    {new Date(booking.show.showDateTime).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </p>
                            </div>

                            {/* Seats */}
                            <div className="col-span-2 flex flex-col justify-center">
                                <div className="flex flex-wrap gap-1">
                                    {booking.bookedSeats.slice(0, 3).map((seat, idx) => (
                                        <span 
                                            key={idx}
                                            className="px-2 py-1 bg-primary/20 text-primary text-xs rounded border border-primary/30"
                                        >
                                            {seat}
                                        </span>
                                    ))}
                                    {booking.bookedSeats.length > 3 && (
                                        <span className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded">
                                            +{booking.bookedSeats.length - 3}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-400 text-xs mt-1">
                                    {booking.bookedSeats.length} seat{booking.bookedSeats.length > 1 ? 's' : ''}
                                </p>
                            </div>

                            {/* Payment */}
                            <div className="col-span-2 flex flex-col justify-center">
                                <div className="flex items-center gap-1">
                                    <span className={`text-xl font-bold ${booking.isPaid ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {currency}{booking.amount}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-xs">
                                    {booking.bookedSeats.length} × {currency}{Math.round(booking.amount / booking.bookedSeats.length)}
                                </p>
                            </div>

                            {/* Status */}
                            <div className="col-span-1 flex items-center justify-center">
                                {getStatusBadge(booking.isPaid)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {bookings.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Bookings Found</h3>
                        <p className="text-gray-400">Bookings will appear here once users make reservations</p>
                    </div>
                )}
            </div>
        </div>
    ) : <Loading />
}

export default ListBookings
