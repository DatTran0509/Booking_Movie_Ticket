import React, { useState, useEffect } from 'react'
import { useAppContext } from '../../context/AppContext'
import Title from '../../components/admin/Title'
import BlurCircle from '../../components/BlurCircle'
import Loading from '../../components/Loading'
import { Calendar, Clock, DollarSign, Plus, DeleteIcon, CheckIcon, Star, MapPin, Info } from 'lucide-react'
import toast from 'react-hot-toast'

const AddShows = () => {
    const {axios, getToken, user} = useAppContext()
    const currency = import.meta.env.VITE_CURRENCY || '$'
    
    const [loading, setLoading] = useState(true)
    const [nowPlayingMovies, setNowPlayingMovies] = useState([])
    const [selectedMovie, setSelectedMovie] = useState(null)
    const [selectedMovieRuntime, setSelectedMovieRuntime] = useState(120)
    const [selectedMovieTitle, setSelectedMovieTitle] = useState('')
    const [showPrice, setShowPrice] = useState('')
    const [selectedHall, setSelectedHall] = useState('')
    const [dateTimeInput, setDateTimeInput] = useState('')
    const [dateTimeSelection, setDateTimeSelection] = useState({})
    const [availableHalls, setAvailableHalls] = useState([])

    const loadAvailableHalls = () => {
        const savedHalls = localStorage.getItem('cinemaHalls')
        if (savedHalls) {
            const halls = JSON.parse(savedHalls)
            const available = halls.filter(hall => hall.isAvailable)
            setAvailableHalls(available)
        } else {
            const defaultHalls = [
                { name: 'Hall 1', isAvailable: true },
                { name: 'Hall 2', isAvailable: true },
                { name: 'Hall 3', isAvailable: true },
                { name: 'Hall 4', isAvailable: true },
                { name: 'Hall 5', isAvailable: true }
            ]
            localStorage.setItem('cinemaHalls', JSON.stringify(defaultHalls))
            setAvailableHalls(defaultHalls)
        }
    }

    const fetchNowPlayingMovies = async () => {
        try {
            const {data} = await axios.get('/api/show/now-playing', {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            
            if (data.success) {
                setNowPlayingMovies(data.movies)
                setLoading(false)
            }
        } catch (error) {
            console.error('Error fetching movies:', error)
            toast.error('Failed to load movies')
        }
    }

    const fetchMovieRuntime = async (movieId) => {
        try {
            const {data} = await axios.get(`/api/show/movie-runtime/${movieId}`, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            
            if (data.success) {
                setSelectedMovieRuntime(data.runtime)
                setSelectedMovieTitle(data.title)
            }
        } catch (error) {
            console.error('Error fetching movie runtime:', error)
            setSelectedMovieRuntime(120)
        }
    }

    const handleMovieSelect = (movieId) => {
        setSelectedMovie(movieId)
        fetchMovieRuntime(movieId)
        setDateTimeSelection({})
    }

    useEffect(() => {
        if (user) {
            fetchNowPlayingMovies()
            loadAvailableHalls()
        }
    }, [user])

    // ✅ Updated validation - Movie runtime + 30 minute gap between shows
    const isTimeSlotValid = (newTimeInput) => {
        if (!newTimeInput || !selectedHall) return false
        
        const newTime = new Date(`${newTimeInput.split('T')[0]}T${newTimeInput.split('T')[1]}`)
        // ✅ Required gap = Movie runtime + 30 minutes buffer
        const requiredGapMs = (selectedMovieRuntime + 30) * 60 * 1000
        
        for (const [date, times] of Object.entries(dateTimeSelection)) {
            for (const time of times) {
                const existingTime = new Date(`${date}T${time}`)
                const timeDiff = Math.abs(newTime - existingTime)
                
                if (timeDiff < requiredGapMs) {
                    return false
                }
            }
        }
        
        return true
    }

    const handleDateTimeAdd = () => {
        if (!dateTimeInput) {
            toast.error('Please select date and time')
            return
        }

        if (!selectedMovie) {
            toast.error('Please select a movie first')
            return
        }

        const selectedDateTime = new Date(dateTimeInput)
        const now = new Date()
        
        if (selectedDateTime <= now) {
            toast.error('Please select a future date and time')
            return
        }

        // ✅ Validate with movie runtime + 30min gap
        if (!isTimeSlotValid(dateTimeInput)) {
            const requiredGapMinutes = selectedMovieRuntime + 30
            toast.error(`This time conflicts with existing shows. Shows need ${requiredGapMinutes} minutes gap (${selectedMovieRuntime}min movie + 30min buffer).`)
            return
        }

        const date = dateTimeInput.split('T')[0]
        const time = dateTimeInput.split('T')[1]

        setDateTimeSelection(prev => {
            const updated = { ...prev }
            if (!updated[date]) {
                updated[date] = []
            }
            
            if (!updated[date].includes(time)) {
                updated[date].push(time)
                updated[date].sort()
                toast.success('Show time added')
            } else {
                toast.error('This time slot already exists')
            }
            
            return updated
        })
        
        setDateTimeInput('')
    }

    const handleRemoveTime = (date, time) => {
        setDateTimeSelection(prev => {
            const updated = { ...prev }
            updated[date] = updated[date].filter(t => t !== time)
            if (updated[date].length === 0) {
                delete updated[date]
            }
            return updated
        })
        toast.success('Show time removed')
    }

    const handleSubmit = async () => {
        if (!selectedMovie || !showPrice || !selectedHall || Object.keys(dateTimeSelection).length === 0) {
            toast.error('Please fill all fields: movie, price, hall, and at least one show time')
            return
        }

        if (parseFloat(showPrice) <= 0) {
            toast.error('Show price must be greater than 0')
            return
        }

        try {
            const showsInput = Object.entries(dateTimeSelection).map(([date, times]) => ({
                date,
                times
            }))

            const {data} = await axios.post('/api/show/add', {
                movieId: selectedMovie,
                showsInput,
                showPrice: parseFloat(showPrice),
                hall: selectedHall
            }, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                toast.success(data.message)
                setSelectedMovie(null)
                setSelectedMovieRuntime(120)
                setSelectedMovieTitle('')
                setShowPrice('')
                setSelectedHall('')
                setDateTimeSelection({})
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error adding shows:', error)
            toast.error('Failed to add shows')
        }
    }

    return !loading ? (
        <div className="min-h-screen bg-black text-white p-6 relative">
            <BlurCircle top='-100px' left='0'/>
            <BlurCircle top='300px' right='100px'/>
            
            {/* Header */}
            <div className="mb-8">
                <Title text1='Add' text2='Shows' />
                <p className="text-gray-400 mt-2">Schedule movie shows across different cinema halls</p>
                {selectedMovie && (
                    <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                        <div className="flex items-center gap-2 text-primary">
                            <Info className="w-5 h-5" />
                            <span className="font-medium">Selected: {selectedMovieTitle}</span>
                            <span className="text-sm">({selectedMovieRuntime} minutes runtime)</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Now Playing Movies Section */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-6">Now Playing Movies</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {nowPlayingMovies.map((movie) => (
                        <div 
                            key={movie.id} 
                            onClick={() => handleMovieSelect(movie.id)}
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
                            <div className="relative overflow-hidden">
                                <img 
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                
                                <div className="absolute top-3 left-3">
                                    <div className="flex items-center gap-1 bg-yellow-500/90 text-white text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                                        <Star className="w-3 h-3 fill-current" />
                                        <span>{movie.vote_average?.toFixed(1) || '8.5'}</span>
                                    </div>
                                </div>

                                {selectedMovie === movie.id && (
                                    <div className="absolute top-3 right-3">
                                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                            <CheckIcon className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4">
                                <h3 className="text-white font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                    {movie.title}
                                </h3>
                                <div className="flex items-center justify-between text-sm text-gray-400">
                                    <span>{movie.release_date}</span>
                                    <span>{movie.vote_count || 1000} Votes</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hall Selection & Show Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Select Cinema Hall
                    </h3>
                    
                    {availableHalls.length === 0 ? (
                        <div className="text-center py-8">
                            <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-400 mb-4">No halls available</p>
                            <p className="text-sm text-gray-500">Please enable halls in Dashboard → Hall Settings</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {availableHalls.map((hall, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedHall(hall.name)}
                                    className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                                        selectedHall === hall.name
                                            ? 'border-primary bg-primary/10 text-white'
                                            : 'border-gray-600/50 bg-gray-700/20 text-gray-300 hover:border-primary/50 hover:bg-primary/5'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold">{hall.name}</h4>
                                            <p className="text-sm text-gray-400">Available for scheduling</p>
                                        </div>
                                        {selectedHall === hall.name && (
                                            <CheckIcon className="w-5 h-5 text-primary" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

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
                    {selectedHall && (
                        <p className="text-gray-400 text-sm mt-2">
                            Setting price for <span className="text-primary font-medium">{selectedHall}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* ✅ Simple Date and Time Selection - NO SUGGEST */}
            <div className="mb-8">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-white" />
                        Select Date and Time
                        {selectedHall && <span className="text-primary text-sm">({selectedHall})</span>}
                        {selectedMovie && (
                            <span className="text-yellow-400 text-sm">
                                Gap needed: {selectedMovieRuntime + 30} min ({selectedMovieRuntime}min + 30min buffer)
                            </span>
                        )}
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
                            disabled={!selectedHall || !selectedMovie}
                            className={`px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-2 ${
                                selectedHall && selectedMovie
                                    ? 'bg-gradient-to-r from-primary to-primary-dull hover:from-primary-dull hover:to-primary text-white shadow-primary/30'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <Plus className="w-4 h-4" />
                            Add Time
                        </button>
                    </div>
                    
                    {(!selectedHall || !selectedMovie) && (
                        <p className="text-yellow-400 text-sm mt-2">Please select a movie and hall first</p>
                    )}
                </div>
            </div>

            {/* Display Selected Date-Time */}
            {Object.keys(dateTimeSelection).length > 0 && (
                <div className="mb-8">
                    <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-white" />
                            Selected Date-Time
                            {selectedHall && <span className="text-primary">({selectedHall})</span>}
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
                                        {times.map((time) => {
                                            const startTime = new Date(`2000-01-01T${time}`)
                                            const endTime = new Date(startTime.getTime() + selectedMovieRuntime * 60000)
                                            
                                            return (
                                                <div 
                                                    key={time} 
                                                    className="flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary px-3 py-2 rounded-lg"
                                                >
                                                    <div className="text-center">
                                                        <div className="font-medium">
                                                            {startTime.toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: true
                                                            })}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            to {endTime.toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: true
                                                            })}
                                                        </div>
                                                    </div>
                                                    <DeleteIcon 
                                                        onClick={() => handleRemoveTime(date, time)} 
                                                        className="w-4 h-4 cursor-pointer hover:text-red-400 transition-colors"
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center">
                <button 
                    onClick={handleSubmit}
                    disabled={!selectedMovie || !showPrice || !selectedHall || Object.keys(dateTimeSelection).length === 0}
                    className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                        selectedMovie && showPrice && selectedHall && Object.keys(dateTimeSelection).length > 0
                            ? 'bg-gradient-to-r from-primary to-primary-dull hover:from-primary-dull hover:to-primary text-white shadow-lg shadow-primary/30 hover:scale-105'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    Add Shows to {selectedHall || 'Cinema'}
                </button>
            </div>
        </div>
    ) : <Loading />
}

export default AddShows