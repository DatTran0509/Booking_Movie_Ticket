import React, { useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import Title from '../../components/admin/Title'
import BlurCircle from '../../components/BlurCircle'
import { Play, Calendar, Clock, Zap, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

const AutoShows = () => {
    const { axios, getToken } = useAppContext()
    const [loading, setLoading] = useState(false)

    const handleGenerateWeek = async () => {
        try {
            setLoading(true)
            const { data } = await axios.post('/api/admin/generate-shows-weekly', {}, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error('Failed to generate shows')
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateTomorrow = async () => {
        try {
            setLoading(true)
            const { data } = await axios.post('/api/admin/generate-shows-tomorrow', {}, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error('Failed to generate shows')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 relative">
            <BlurCircle top='-100px' left='0'/>
            <BlurCircle top='300px' right='100px'/>
            
            <div className="relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <Title text1='Auto' text2='Shows' />
                    <p className="text-gray-400 mt-2">Automatic show generation for demo purposes</p>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <Settings className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Auto Generation</h3>
                                <p className="text-blue-400 text-sm">Runs daily at 2:00 AM</p>
                            </div>
                        </div>
                        <p className="text-gray-300 text-sm">
                            Automatically generates 2-3 movie shows every day, 7 days in advance. 
                            This ensures customers always have shows to book.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <Zap className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Smart Selection</h3>
                                <p className="text-green-400 text-sm">Random TMDB movies</p>
                            </div>
                        </div>
                        <p className="text-gray-300 text-sm">
                            Fetches random movies from TMDB, creates complete movie records with 
                            trailers, cast, and schedules them across different halls.
                        </p>
                    </div>
                </div>

                {/* Manual Controls */}
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <Play className="w-6 h-6 text-primary" />
                        Manual Generation
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Generate Next Week */}
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Calendar className="w-8 h-8 text-purple-400" />
                                <div>
                                    <h4 className="text-lg font-bold text-white">Generate Next Week</h4>
                                    <p className="text-purple-400 text-sm">7 days of shows</p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm mb-4">
                                Creates 10 random movies with multiple shows across all halls for the next 7 days.
                                Perfect for initial setup.
                            </p>
                            <button
                                onClick={handleGenerateWeek}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                ) : (
                                    <>
                                        <Calendar className="w-5 h-5" />
                                        Generate Week
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Generate Tomorrow */}
                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Clock className="w-8 h-8 text-orange-400" />
                                <div>
                                    <h4 className="text-lg font-bold text-white">Generate Tomorrow</h4>
                                    <p className="text-orange-400 text-sm">Single day shows</p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm mb-4">
                                Creates 2-3 random movies with shows for tomorrow only. 
                                Simulates the daily auto-generation process.
                            </p>
                            <button
                                onClick={handleGenerateTomorrow}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                ) : (
                                    <>
                                        <Clock className="w-5 h-5" />
                                        Generate Tomorrow
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-yellow-400 mb-3">📝 Instructions</h4>
                    <ul className="text-gray-300 text-sm space-y-2">
                        <li>• <strong>Initial Setup:</strong> Click "Generate Next Week" to populate your cinema with shows</li>
                        <li>• <strong>Daily Operation:</strong> The system automatically generates shows every day at 2:00 AM</li>
                        <li>• <strong>Manual Testing:</strong> Use "Generate Tomorrow" to test the daily generation process</li>
                        <li>• <strong>Movie Selection:</strong> System randomly selects movies from TMDB's now playing list</li>
                        <li>• <strong>Hall Distribution:</strong> Shows are randomly distributed across Hall 1-5</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default AutoShows