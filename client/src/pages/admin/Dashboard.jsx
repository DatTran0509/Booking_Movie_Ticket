import { ChartLineIcon, CircleDollarSignIcon, PlayCircleIcon, StarIcon, CalendarIcon, TrendingUpIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import BlurCircle from '../../components/BlurCircle'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import HallSettings from '../../components/admin/HallSettings'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
)

const Dashboard = () => {
  const {axios, getToken, user} = useAppContext()
  const currency = import.meta.env.VITE_CURRENCY

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: 0,
    monthlyData: [],
    yearlyData: []
  })

  const [loading, setLoading] = useState(true)
  const [chartPeriod, setChartPeriod] = useState('monthly') // 'monthly' or 'yearly'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const dashboardCard = [
    { 
      title: 'Total Bookings', 
      value: dashboardData.totalBookings || '0', 
      icon: ChartLineIcon,
      cardStyle: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30',
      titleColor: 'text-blue-400',
      iconStyle: 'bg-blue-500/20',
      iconColor: 'text-blue-400'
    },
    { 
      title: 'Total Revenue', 
      value: `${currency}${dashboardData.totalRevenue || '0'}`, 
      icon: CircleDollarSignIcon,
      cardStyle: 'bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30',
      titleColor: 'text-green-400',
      iconStyle: 'bg-green-500/20',
      iconColor: 'text-green-400'
    },
    { 
      title: "Active Shows", 
      value: dashboardData.activeShows || '0', 
      icon: PlayCircleIcon,
      cardStyle: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30',
      titleColor: 'text-purple-400',
      iconStyle: 'bg-purple-500/20',
      iconColor: 'text-purple-400'
    }
  ]

  const fetchDashboardData = async () => {
    try {
      const {data} = await axios.get('/api/admin/dashboard-revenue', {
        headers: { Authorization: `Bearer ${await getToken()}`},
        params: { year: selectedYear }
      })
      console.log('Dashboard Data:', data.dashboardData)
      if (data.success) {
        setDashboardData(data.dashboardData)
        setLoading(false)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Error fetching dashboard data')
    }
  }

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user, selectedYear])

  // ✅ Prepare chart data
  const getChartData = () => {
    if (chartPeriod === 'monthly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      
      return {
        labels: months,
        datasets: [
          {
            label: 'Total Bookings',
            data: dashboardData.monthlyData?.map(m => m.totalBookings) || new Array(12).fill(0),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Revenue',
            data: dashboardData.monthlyData?.map(m => m.totalRevenue) || new Array(12).fill(0),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      }
    } else {
      const currentYear = new Date().getFullYear()
      const years = Array.from({length: 5}, (_, i) => currentYear - 4 + i)
      
      return {
        labels: years,
        datasets: [
          {
            label: 'Total Bookings',
            data: dashboardData.yearlyData?.map(y => y.totalBookings) || new Array(5).fill(0),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
          },
          {
            label: 'Revenue',
            data: dashboardData.yearlyData?.map(y => y.totalRevenue) || new Array(5).fill(0),
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
          }
        ]
      }
    }
  }

  // ✅ Chart options
  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1
      }
    },
    scales: chartPeriod === 'monthly' ? {
      x: {
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: { color: 'rgba(59, 130, 246, 0.8)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: { color: 'rgba(34, 197, 94, 0.8)' },
        grid: { drawOnChartArea: false }
      }
    } : {
      x: {
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      y: {
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      }
    }
  }

  // ✅ Revenue distribution data
  const getRevenueDistribution = () => {
    const currentMonthData = dashboardData.monthlyData?.[new Date().getMonth()] || { paidRevenue: 0, pendingRevenue: 0 }
    
    return {
      labels: ['Paid Revenue', 'Pending Revenue'],
      datasets: [{
        data: [currentMonthData.paidRevenue || 0, currentMonthData.pendingRevenue || 0],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)'
        ],
        borderWidth: 2
      }]
    }
  }

  return !loading ? (
    <div className="min-h-screen bg-black text-white p-6 relative">
      {/* Background Effects */}
      <BlurCircle top='-100px' left='0'/>
      <BlurCircle top='300px' right='100px'/>
      
      {/* Header */}
      <div className="mb-8">
        <Title text1='Admin' text2='Dashboard' />
        <p className="text-gray-400 mt-2">Revenue analytics and performance overview</p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {dashboardCard.map((card, index) => (
          <div 
            key={index}
            className={`${card.cardStyle} backdrop-blur-sm border rounded-xl p-4 hover:scale-105 transition-all duration-300 group`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${card.iconStyle} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <div>
                <p className={`${card.titleColor} font-semibold text-sm`}>
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-white">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Revenue Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
        {/* Main Chart */}
        <div className="xl:col-span-2">
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
            {/* Chart Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <TrendingUpIcon className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Revenue Analytics</h3>
              </div>
              
              {/* Controls */}
              <div className="flex items-center gap-4">
                {/* Year Selector */}
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-1 text-white text-sm"
                >
                  {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 4 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                
                {/* Period Toggle */}
                <div className="flex bg-gray-700/30 rounded-lg p-1">
                  <button
                    onClick={() => setChartPeriod('monthly')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      chartPeriod === 'monthly' 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setChartPeriod('yearly')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      chartPeriod === 'yearly' 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-80">
              {chartPeriod === 'monthly' ? (
                <Line data={getChartData()} options={chartOptions} />
              ) : (
                <Bar data={getChartData()} options={chartOptions} />
              )}
            </div>
          </div>
        </div>

        {/* Revenue Distribution */}
        <div className="space-y-6">
          {/* Current Month Revenue Split */}
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CircleDollarSignIcon className="w-5 h-5 text-green-400" />
              <h4 className="text-lg font-semibold text-white">Revenue Split</h4>
            </div>
            
            <div className="h-48 mb-4">
              <Doughnut 
                data={getRevenueDistribution()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: 'white',
                        font: { size: 10 }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              <h4 className="text-lg font-semibold text-white">Quick Stats</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">This Month</span>
                <span className="text-green-400 font-semibold">
                  {currency}{dashboardData.monthlyData?.[new Date().getMonth()]?.totalRevenue || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Last Month</span>
                <span className="text-gray-300 font-semibold">
                  {currency}{dashboardData.monthlyData?.[new Date().getMonth() - 1]?.totalRevenue || 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-600/30">
                <span className="text-gray-400 text-sm">Average/Month</span>
                <span className="text-blue-400 font-semibold">
                  {currency}{dashboardData.monthlyData?.length > 0 
                    ? Math.round(dashboardData.monthlyData.reduce((sum, m) => sum + m.totalRevenue, 0) / dashboardData.monthlyData.length)
                    : 0
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Monthly Breakdown Table */}
      <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 border-b border-gray-700/50 p-6">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-white">Monthly Breakdown {selectedYear}</h3>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Bookings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Paid Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Pending Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
                const monthData = dashboardData.monthlyData?.[index] || { totalBookings: 0, paidRevenue: 0, pendingRevenue: 0, totalRevenue: 0 }
                return (
                  <tr key={month} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{month}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400">{monthData.totalBookings}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">{currency}{monthData.paidRevenue}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400">{currency}{monthData.pendingRevenue}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">{currency}{monthData.totalRevenue}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Hall Settings Section */}
      <div className="mb-12">
        <HallSettings />
      </div>
    </div>
  ) : <Loading />
}

export default Dashboard