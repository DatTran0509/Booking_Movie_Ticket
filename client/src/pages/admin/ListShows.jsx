import React, { useEffect, useState } from 'react'
import { dummyShowsData } from '../../assets/assets'
import Title from '../../components/admin/Title'
import { dateFormat } from '../../lib/dateFormat'
import Loading from '../../components/Loading'
import BlurCircle from '../../components/BlurCircle'
import { Calendar, Clock, DollarSign, Users, Eye } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
const ListShows = () => {
    const {axios, getToken, user, image_base_url} = useAppContext()
    

    const currency = import.meta.env.VITE_CURRENCY || '$'
    const [shows, setShows] = useState([])
    const [loading, setLoading] = useState(true)

    const getAllShows = async () => {
        try {
            const {data} = await axios.get('/api/admin/all-shows', {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            setShows(data.shows)
            setLoading(false)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if(user) {
            getAllShows()
        }
    }, [user])

    const getTotalBookings = (show) => {
        return show.bookedSeats ? show.bookedSeats.length : 0
    }

    const getTotalEarning = (show) => {
        const bookings = getTotalBookings(show)
        return bookings * show.showPrice
    }

    return !loading ? (
        <div className="min-h-screen bg-black text-white p-6 relative">
            {/* Background Effects */}
            <BlurCircle top='-100px' left='0'/>
            <BlurCircle top='300px' right='100px'/>
            
            {/* Header */}
            <div className="mb-8">
                <Title text1='List' text2='Shows' />
                <p className="text-gray-400 mt-2">Manage all movie shows and their bookings</p>
            </div>

            {/* Shows Table */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="bg-gradient-to-r from-primary/20 to-primary/10 border-b border-gray-700/50">
                    <div className="grid grid-cols-12 gap-6 p-6 text-sm font-semibold text-gray-300 uppercase tracking-wide">
                        <div className="col-span-5 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-primary" />
                            Movie Name
                        </div>
                        <div className="col-span-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            Show Time
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            Total Booking
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-primary" />
                            Earning
                        </div>
                    </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-700/30">
                    {shows.map((show, index) => (
                        <div 
                            key={show._id || index}
                            className="grid grid-cols-12 gap-6 p-6 hover:bg-white/5 transition-all duration-300 group"
                        >
                            {/* Movie Name - Tăng từ col-span-4 lên col-span-5 */}
                            <div className="col-span-5 flex items-center gap-3">
                                <div className="relative flex-shrink-0">
                                    <img 
                                        src={image_base_url+show.movie.poster_path} 
                                        alt={show.movie.title}
                                        className="w-14 h-20 object-cover rounded-lg border border-gray-600"
                                    />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-gray-900"></div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold text-base group-hover:text-primary transition-colors line-clamp-2">
                                        {show.movie.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-yellow-500 text-sm">
                                            ⭐ {show.movie.vote_average?.toFixed(1) || '8.5'}
                                        </span>
                                        <span className="text-gray-400 text-sm">
                                            {show.movie.runtime || '120'} min
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-xs mt-1">
                                        {show.movie.release_date || '2024'}
                                    </p>
                                </div>
                            </div>

                            {/* Show Time */}
                            <div className="col-span-3 flex flex-col justify-center">
                                <div className="flex items-center gap-2 text-gray-300 mb-1">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span className="font-medium">{dateFormat(show.showDateTime)}</span>
                                </div>
                                <p className="text-gray-400 text-sm">
                                    {new Date(show.showDateTime).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-primary text-sm font-medium">
                                        {currency}{show.showPrice}
                                    </span>
                                    <span className="text-gray-500 text-xs">per seat</span>
                                </div>
                            </div>

                            {/* Total Bookings */}
                            <div className="col-span-2 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-2xl font-bold text-white">
                                        {getTotalBookings(show)}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm">Seats booked</p>
                                <div className="w-full bg-gray-700/30 rounded-full h-2 mt-2">
                                    <div 
                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(getTotalBookings(show) / 50) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Earnings */}
                            <div className="col-span-2 flex flex-col justify-center">
                                <div className="flex items-center gap-1 mb-1">
                                    <span className="text-2xl font-bold text-green-400">
                                        {currency}{getTotalEarning(show)}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm">Total revenue</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-green-400 text-xs font-medium">Active</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {shows.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Eye className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Shows Found</h3>
                        <p className="text-gray-400">Add some movie shows to see them here</p>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            {shows.length > 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <Eye className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-blue-400 font-semibold">Total Shows</p>
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
                                <p className="text-green-400 font-semibold">Total Bookings</p>
                                <p className="text-2xl font-bold text-white">
                                    {shows.reduce((acc, show) => acc + getTotalBookings(show), 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-yellow-400 font-semibold">Total Revenue</p>
                                <p className="text-2xl font-bold text-white">
                                    {currency}{shows.reduce((acc, show) => acc + getTotalEarning(show), 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    ) : <Loading />
}

export default ListShows
