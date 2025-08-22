import { ChartLineIcon, CircleDollarSignIcon, PlayCircleIcon, StarIcon, UsersIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { dummyDashboardData } from '../../assets/assets'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import { dateFormat } from '../../lib/dateFormat'
import BlurCircle from '../../components/BlurCircle'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
const Dashboard = () => {
  const {axios, getToken, user, image_base_url} = useAppContext()
  const currency = import.meta.env.VITE_CURRENCY
  const [bookings, setBookings] = useState([])

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUsers: 0
  })

  const [loading, setLoading] = useState(true)

  const dashboardCard = [
    { title: 'Total Bookings', value: dashboardData.totalBookings || '0', icon: ChartLineIcon },
    { title: 'Total Revenue', value: `${currency} ${dashboardData.totalRevenue || '0'}`, icon: CircleDollarSignIcon },
    { title: "Active Shows", value: dashboardData.activeShows.length || '0', icon: PlayCircleIcon },
    { title: 'Total Users', value: dashboardData.totalUsers || '0', icon: UsersIcon }
  ]

  const fetchDashboardData = async () => {
    try {
      const {data} = await axios.get('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${await getToken()}`}
      })

      if (data.success) {
        setDashboardData(data.dashboardData)
        setLoading(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Error fetching dashboard data', error)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  console.log('Dashboard Data:', dashboardData)

  return !loading ? (
    <div className="min-h-screen bg-black text-white p-6 relative">
      {/* Background Effects */}
      <BlurCircle top='-100px' left='0'/>
      <BlurCircle top='300px' right='100px'/>
      
      {/* Header */}
      <div className="mb-8">
        <Title text1='Admin' text2='Dashboard' />
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {dashboardCard.map((card, index) => (
          <div 
            key={index}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-gray-400 text-sm font-medium mb-2 group-hover:text-gray-300 transition-colors">
                  {card.title}
                </h3>
                <p className="text-2xl font-bold text-white group-hover:text-primary transition-colors">
                  {card.value}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <card.icon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Shows Section */}
      <div className="relative">
        <BlurCircle top='100px' left='0'/>
        
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Active Movies</h2>
          <div className="w-20 h-1 bg-primary rounded-full"></div>
        </div>

        {/* Movies Grid - Updated to 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dashboardData.activeShows.map((show, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:scale-105 group"
            >
              {/* Movie Poster */}
              <div className="relative overflow-hidden">
                <img 
                  src={image_base_url + show.movie.poster_path} 
                  alt={show.movie.title}
                  className="w-full h-60 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <div className="bg-green-500/90 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                    ACTIVE
                  </div>
                </div>
              </div>

              {/* Movie Info */}
              <div className="p-4">
                {/* Title */}
                <h3 className="text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {show.movie.title}
                </h3>

                {/* Price & Rating */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      {currency}{show.showPrice}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-lg">
                    <StarIcon className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-yellow-500 font-semibold text-xs">
                      {show.movie.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Show Date */}
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>{dateFormat(show.showDateTime)}</span>
                </div>

                {/* Additional Info */}
                <div className="mt-3 pt-3 border-t border-gray-700/30">
                  <div className="space-y-2">
                    {/* Duration */}
                    <div className="text-xs text-gray-400">
                      Duration: {show.movie.runtime || '120'} min
                    </div>
                    
                    {/* Genres */}
                    <div className="flex flex-wrap gap-1">
                      {show.movie.genres?.length > 0 ? (
                        show.movie.genres.slice(0, 3).map((genre, genreIndex) => (
                          <span 
                            key={genreIndex}
                            className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs"
                          >
                            {genre.name}
                          </span>
                        ))
                      ) : (
                        <span className="bg-gray-700/50 text-gray-400 px-2 py-1 rounded-full text-xs">
                          No Genres
                        </span>
                      )}
                      {show.movie.genres?.length > 3 && (
                        <span className="bg-gray-700/50 text-gray-400 px-2 py-1 rounded-full text-xs">
                          +{show.movie.genres.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {dashboardData.activeShows.length > 8 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dull hover:from-primary-dull hover:to-primary text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/30">
              View All Movies ({dashboardData.activeShows.length})
            </button>
          </div>
        )}
      </div>
    </div>
  ) : <Loading />
}

export default Dashboard
