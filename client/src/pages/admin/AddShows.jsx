import React, { useState, useEffect } from 'react'
import { dummyShowsData } from '../../assets/assets'
import Loading from '../../components/Loading'
import Title from '../../components/admin/Title'
import BlurCircle from '../../components/BlurCircle'
import { kConverter } from '../../lib/kConverter'
import { CheckIcon, DeleteIcon, Star, Calendar, Clock, DollarSign, Plus } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const AddShows = () => {
    const {axios, getToken, user, image_base_url} = useAppContext();

    const currency = import.meta.env.VITE_CURRENCY || '$'
    const [nowPlayingMovies, setNowPlayingMovies] = useState([])
    const [selectedMovie, setSelectedMovie] = useState(null)
    const [dateTimeSelection, setDateTimeSelection] = useState({})
    const [dateTimeInput, setDateTimeInput] = useState('')
    const [showPrice, setShowPrice] = useState('')
    const [addingShow, setAddingShow] = useState(false)     

    const fetchNowPlayingMovies = async () => {
        try {
            const {data} = await axios.get('/api/show/now-playing', {
                headers: {Authorization: `Bearer ${await getToken()}`}
            })
            if(data.success) {
                setNowPlayingMovies(data.movies)
            }
        } catch (error) {
            console.error('Error fetching now playing movies:', error)
            // ✅ Fallback to dummy data nếu API fail
            setNowPlayingMovies(dummyShowsData)
        }
    }

    const handleDateTimeAdd = () => {
        if (!dateTimeInput) {
            toast.error('Please select a date and time')
            return
        }
        const [date, time] = dateTimeInput.split('T');
        if (!date || !time) return;

        setDateTimeSelection((prev) => {
            const times = prev[date] || [];
            if (!times.includes(time)) {
                return {
                    ...prev,
                    [date]: [...times, time]
                }
            }
            return prev;
        })
        setDateTimeInput('') // Clear input after adding
    }

    const handleRemoveTime = (date, time) => {
        setDateTimeSelection((prev) => {
            const filteredTimes = prev[date].filter(t => t !== time);
            if (filteredTimes.length === 0) {
                const { [date]: _, ...rest } = prev;
                return rest;
            }
            return {
                ...prev,
                [date]: filteredTimes
            }
        })
    }

    const handleAddShow = async () => {
        try {
            setAddingShow(true)
            
            // ✅ Validation với early return
            if (!selectedMovie || !showPrice || Object.keys(dateTimeSelection).length === 0) {
                toast.error('Missing required fields')
                return
            }

            const showsInput = Object.entries(dateTimeSelection).map(([date, times]) => ({
                date,
                times,
            }))
            
            const payload = {
                movieId: selectedMovie,
                showsInput,
                showPrice: parseFloat(showPrice),
            }


            const {data} = await axios.post('/api/show/add', payload, {
                headers: {Authorization: `Bearer ${await getToken()}`}
            })
            
            
            if(data.success) {
                toast.success('Show added successfully')
                // ✅ FIX: Dùng setSelectedMovie thay vì selectedMovie
                setSelectedMovie(null)
                setDateTimeSelection({})
                setShowPrice('')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('❌ Error adding show:', error)
            toast.error(error.response?.data?.message || 'Failed to add show')
        } finally {
            // ✅ Đảm bảo setAddingShow(false) luôn chạy
            setAddingShow(false)
        }
    }

    useEffect(() => {
        if(user) {
            fetchNowPlayingMovies()
        }
    }, [user])

    return nowPlayingMovies.length > 0 ? (
        <div className="min-h-screen bg-black text-white p-6 relative">
            {/* Background Effects */}
            <BlurCircle top='-100px' left='0'/>
            <BlurCircle top='300px' right='100px'/>
            
            {/* Header */}
            <div className="mb-8">
                <Title text1='Add' text2='Shows' />
            </div>

            {/* Now Playing Movies Section */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-6">Now Playing Movies</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {nowPlayingMovies.map((movie) => (
                        <div 
                            key={movie.id} 
                            onClick={() => setSelectedMovie(movie.id)}
                            className={`
                                relative bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm 
                                border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 
                                hover:scale-105 group
                                ${selectedMovie === movie.id 
                                    ? 'border-primary shadow-lg shadow-primary/20' 
                                    : 'border-gray-700/30 hover:border-primary/50'
                                }
                            `}
                        >
                            {/* Movie Poster */}
                            <div className="relative overflow-hidden">
                                <img 
                                    src={image_base_url + movie.poster_path} 
                                    alt={movie.title}
                                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                
                                {/* Rating Badge */}
                                <div className="absolute top-3 left-3">
                                    <div className="flex items-center gap-1 bg-yellow-500/90 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                                        <Star className="w-3 h-3 fill-current" />
                                        <span>{movie.vote_average?.toFixed(1) || '8.5'}</span>
                                    </div>
                                </div>

                                {/* Selection Indicator */}
                                {selectedMovie === movie.id && (
                                    <div className="absolute top-3 right-3">
                                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                            <CheckIcon className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Movie Info */}
                            <div className="p-4">
                                <h3 className="text-white font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                    {movie.title}
                                </h3>
                                <div className="flex items-center justify-between text-sm text-gray-400">
                                    <span>{movie.release_date}</span>
                                    <span>{kConverter(movie.vote_count || 1000)} Votes</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Show Price Input */}
            <div className="mb-8">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        Show Price
                    </h3>
                    
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary font-bold text-lg">
                            {currency}
                        </div>
                        <input 
                            type="number"
                            value={showPrice}
                            onChange={(e) => setShowPrice(e.target.value)}
                            placeholder="Enter show price"
                            min="0"
                            step="0.01"
                            className="w-full pl-12 pr-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        />
                    </div>
                </div>
            </div>

            {/* Select Date and Time */}
            <div className="mb-8">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-white" />
                        Select Date and Time
                    </h3>
                    
                    <div className="flex gap-3 items-end">
                        <div className="flex-1">
                            <input 
                                type="datetime-local" 
                                value={dateTimeInput} 
                                onChange={(e) => setDateTimeInput(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                            />
                        </div>
                        <button 
                            onClick={handleDateTimeAdd}
                            className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dull hover:from-primary-dull hover:to-primary text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/30 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Time
                        </button>
                    </div>
                </div>
            </div>

            {/* Display Selected Date-Time */}
            {Object.keys(dateTimeSelection).length > 0 && (
                <div className="mb-8">
                    <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-white" />
                            Selected Date-Time
                        </h3>
                        
                        <div className="space-y-4">
                            {Object.entries(dateTimeSelection).map(([date, times]) => (
                                <div key={date} className="bg-gray-700/20 rounded-xl p-4">
                                    <div className="text-primary font-semibold mb-3 text-lg">
                                        {new Date(date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {times.map((time) => (
                                            <div 
                                                key={time} 
                                                className="flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary px-3 py-2 rounded-lg"
                                            >
                                                <span className="font-medium">
                                                    {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    })}
                                                </span>
                                                <DeleteIcon 
                                                    onClick={() => handleRemoveTime(date, time)} 
                                                    className="w-4 h-4 cursor-pointer text-red-400 hover:text-red-300 transition-colors" 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Show Button */}
            <div className="text-center">
                <button 
                    onClick={handleAddShow}
                    className="px-8 py-4 bg-gradient-to-r from-primary to-primary-dull hover:from-primary-dull hover:to-primary text-white font-bold text-lg rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={addingShow || !selectedMovie || !showPrice || Object.keys(dateTimeSelection).length === 0}
                >
                    {addingShow ? 'Adding Show...' : 'Add Show'}
                </button>
            </div>

            {/* ✅ Debug panel để kiểm tra */}
            {/* {process.env.NODE_ENV === 'development' && (
                <div className="fixed bottom-4 right-4 bg-gray-900/90 p-3 rounded-lg text-xs border border-gray-700">
                    <div className="text-green-400">Debug Info:</div>
                    <div>Selected: {selectedMovie || 'None'}</div>
                    <div>Price: {showPrice || 'Empty'}</div>
                    <div>Times: {Object.keys(dateTimeSelection).length}</div>
                    <div>Valid: {selectedMovie && showPrice && Object.keys(dateTimeSelection).length > 0 ? '✅' : '❌'}</div>
                </div>
            )} */}
        </div>
    ) : <Loading />
}

export default AddShows