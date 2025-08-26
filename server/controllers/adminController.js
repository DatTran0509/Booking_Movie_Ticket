import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Movie from "../models/Movie.js";
import axios from "axios";
import autoShowService from '../services/autoShowService.js' 
// API to check if user is admin
export const isAdmin = async (req, res) => {
    res.json({ success: true, isAdmin: true });
}

// API to get dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const bookings = await Booking.find({ isPaid: true })

        // ✅ FIX: Populate full movie details thay vì chỉ movieId
        const activeShows = await Show.find({ showDateTime: { $gte: new Date() } })
            .populate({
                path: 'movie',
                model: 'Movie',
                select: 'title poster_path backdrop_path overview genres release_date vote_average runtime' // ✅ Select specific fields
            })
            .sort({ showDateTime: 1 });

        const totalUser = await User.countDocuments();

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((total, booking) => total + booking.amount, 0),
            activeShows,
            totalUser
        }

        res.json({ success: true, dashboardData });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.json({ success: false, message: error.message });
    }
}

// API to get all shows
export const getAllShows = async (req, res) => {
    try {
        // ✅ Cũng fix luôn cho getAllShows
        const shows = await Show.find({ showDateTime: { $gte: new Date() } })
            .populate({
                path: 'movie',
                model: 'Movie',
                select: 'title poster_path backdrop_path overview genres release_date vote_average runtime'
            })
            .sort({ showDateTime: 1 });

        res.json({ success: true, shows });
    } catch (error) {
        console.error('Get shows error:', error);
        res.json({ success: false, error: error.message });
    }
}

// API to get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('user') // ✅ Populate all user fields
            .populate({
                path: 'show',
                model: 'Show',
                populate: {
                    path: 'movie',
                    model: 'Movie',
                    select: 'title poster_path backdrop_path overview genres release_date vote_average runtime'
                }
            })
            .sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (error) {
        console.error(error);
        res.json({ success: false, error: error.message });
    }
}
// In your backend controller
export const getDashboardRevenue = async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query
        
        // Get all bookings for the year
        const bookings = await Booking.find({
            createdAt: {
                $gte: new Date(`${year}-01-01`),
                $lt: new Date(`${parseInt(year) + 1}-01-01`)
            }
        }).populate('show').sort({ createdAt: -1 })
        
        // Calculate total stats
        const totalBookings = bookings.reduce((sum, booking) => sum + (booking.bookedSeats?.length || 0), 0)
        const totalRevenue = bookings
            .filter(booking => booking.isPaid)
            .reduce((sum, booking) => sum + (booking.amount || 0), 0)
        
        // Get active shows count
        const activeShows = await Show.countDocuments({
            showDateTime: { $gte: new Date() }
        })
        
        // Calculate monthly data
        const monthlyData = Array.from({ length: 12 }, (_, monthIndex) => {
            const monthBookings = bookings.filter(booking => {
                const bookingMonth = new Date(booking.createdAt).getMonth()
                return bookingMonth === monthIndex
            })
            
            const totalBookings = monthBookings.reduce((sum, booking) => sum + (booking.bookedSeats?.length || 0), 0)
            const paidRevenue = monthBookings
                .filter(booking => booking.isPaid)
                .reduce((sum, booking) => sum + (booking.amount || 0), 0)
            const pendingRevenue = monthBookings
                .filter(booking => !booking.isPaid)
                .reduce((sum, booking) => sum + (booking.amount || 0), 0)
            
            return {
                month: monthIndex,
                totalBookings,
                paidRevenue,
                pendingRevenue,
                totalRevenue: paidRevenue + pendingRevenue
            }
        })
        // console.log('Monthly Data:', monthlyData)
        
        // Calculate yearly data (last 5 years)
        const currentYear = new Date().getFullYear()
        const yearlyData = []
        
        for (let i = 4; i >= 0; i--) {
            const targetYear = currentYear - i
            const yearBookings = await Booking.find({
                createdAt: {
                    $gte: new Date(`${targetYear}-01-01`),
                    $lt: new Date(`${targetYear + 1}-01-01`)
                }
            })
            
            const totalBookings = yearBookings.reduce((sum, booking) => sum + (booking.bookedSeats?.length || 0), 0)
            const totalRevenue = yearBookings
                .filter(booking => booking.isPaid)
                .reduce((sum, booking) => sum + (booking.amount || 0), 0)
            
            yearlyData.push({
                year: targetYear,
                totalBookings,
                totalRevenue
            })
        }
        
        res.json({
            success: true,
            dashboardData: {
                totalBookings,
                totalRevenue,
                activeShows,
                monthlyData,
                yearlyData
            }
        })
        
    } catch (error) {
        console.error('Error fetching dashboard revenue:', error)
        res.json({ success: false, message: 'Server error' })
    }
}

  // Get shows by month
  export const getShowsByMonth = async (req, res) => {
    try {
        const { month, year } = req.query
        
        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, parseInt(month) + 1, 0, 23, 59, 59)
        
        const shows = await Show.find({
            showDateTime: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('movie').sort({ showDateTime: 1 })
        
        res.json({ success: true, shows })
    } catch (error) {
        res.json({ success: false, message: 'Server error' })
    }
}

 // Get bookings by month
 export const getBookingsByMonth = async (req, res) => {
    try {
        const { month, year } = req.query
        
        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, parseInt(month) + 1, 0, 23, 59, 59)
        
        const bookings = await Booking.find({
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('user').populate({
            path: 'show',
            populate: {
                path: 'movie'
            }
        }).sort({ createdAt: -1 })
        
        res.json({ success: true, bookings })
    } catch (error) {
        res.json({ success: false, message: 'Server error' })
    }
}

// ✅ Helper function to check time conflicts
const checkTimeConflicts = async (hall, showDateTime, excludeShowId = null) => {
    const showTime = new Date(showDateTime);
    const bufferTime = 15 * 60 * 1000; // 15 minutes in milliseconds
    
    // Check for shows in the same hall within 15 minutes before or after
    const conflictingShows = await Show.find({
        hall: hall,
        _id: { $ne: excludeShowId }, // Exclude current show if updating
        showDateTime: {
            $gte: new Date(showTime.getTime() - bufferTime),
            $lte: new Date(showTime.getTime() + bufferTime)
        }
    });
    
    return conflictingShows.length > 0;
};

// API to add show
export const addShow = async (req, res) => {
    try {
        const { movieId, showsInput, showPrice, hall } = req.body;

        // ✅ Validate hall
        if (!hall || typeof hall !== 'string' || hall.trim() === '') {
            return res.json({success: false, message: "Hall selection is required"});
        }

        // ✅ Validate all show times for conflicts
        const allShowTimes = [];
        showsInput.forEach(show => {
            const showDate = show.date;
            show.times.forEach((time) => {
                const dateTimeString = `${showDate}T${time}`;
                allShowTimes.push(new Date(dateTimeString));
            });
        });

        // Check for conflicts with existing shows
        for (const showTime of allShowTimes) {
            const hasConflict = await checkTimeConflicts(hall, showTime);
            if (hasConflict) {
                return res.json({
                    success: false, 
                    message: `Time conflict detected in ${hall} at ${showTime.toLocaleString()}. Shows must be at least 15 minutes apart.`
                });
            }
        }

        // Check for conflicts within the new shows being added
        const sortedTimes = allShowTimes.sort((a, b) => a - b);
        for (let i = 1; i < sortedTimes.length; i++) {
            const timeDiff = sortedTimes[i] - sortedTimes[i-1];
            if (timeDiff < 15 * 60 * 1000) { // Less than 15 minutes
                return res.json({
                    success: false,
                    message: `Shows in ${hall} must be at least 15 minutes apart. Conflict between ${sortedTimes[i-1].toLocaleString()} and ${sortedTimes[i].toLocaleString()}`
                });
            }
        }

        // Check if movie exists, if not fetch from API
        let movie = await Movie.findById(movieId);
        
        if (!movie) {
            // Fetch movie details from API
            const movieApiData = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`);
            const movieCreditsData = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${process.env.TMDB_API_KEY}`);
            const movieVideosData = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${process.env.TMDB_API_KEY}`);

            const trailers = movieVideosData.data.results
                .filter(video => video.type === 'Trailer' && video.site === 'YouTube')
                .sort((a, b) => {
                    return b.size - a.size;
                });

            const movieDetail = {
                _id: movieId,
                title: movieApiData.data.title,
                overview: movieApiData.data.overview,
                poster_path: movieApiData.data.poster_path,
                backdrop_path: movieApiData.data.backdrop_path,
                genres: movieApiData.data.genres,
                casts: movieCreditsData.data.cast,
                release_date: movieApiData.data.release_date,
                original_language: movieApiData.data.original_language,
                tagline: movieApiData.data.tagline,
                vote_average: movieApiData.data.vote_average,
                runtime: movieApiData.data.runtime,
                trailers: trailers
            };
            
            movie = await Movie.create(movieDetail);
        }

        // Create shows
        const showsToCreate = [];
        showsInput.forEach(show => {
            const showDate = show.date;
            show.times.forEach((time) => {
                const dateTimeString = `${showDate}T${time}`;
                showsToCreate.push({
                    movie: movieId,
                    showDateTime: new Date(dateTimeString),
                    showPrice,
                    hall, // ✅ Simple string hall
                    occupiedSeats: {}
                });
            });
        });
        
        if(showsToCreate.length > 0) {
            await Show.insertMany(showsToCreate);
        }
        
        res.json({success: true, message: `${showsToCreate.length} shows added successfully to ${hall}`});

    } catch (error) {
        console.error(error);
        res.json({success: false, error: error.message});
    }
}

// ✅ Update other functions to handle string hall
export const getShows = async (req, res) => {
    try {
        const shows = await Show.find({showDateTime: {$gte: new Date()}})
            .populate('movie')
            .sort({hall: 1, showDateTime: 1}); // Sort by hall first, then time

        const uniqueShows = new Set(shows.map(show => show.movie));  
        res.json({success: true, shows: Array.from(uniqueShows)});
    } catch (error) {
        console.error(error);
        res.json({success: false, error: error.message});
    }
}

export const getShow = async (req, res) => {
    try {
        const {movieId} = req.params;
        if (!movieId) {
            return res.json({success: false, error: "Movie ID is required"});
        }

        const shows = await Show.find({movie: movieId, showDateTime: {$gte: new Date()}});
        const movie = await Movie.findById(movieId);
        
        const dateTime = {};
        shows.forEach((show) => {
            const date = show.showDateTime.toISOString().split('T')[0];
            if (!dateTime[date]) {  
                dateTime[date] = [];
            }
            dateTime[date].push({
                time: show.showDateTime, 
                showId: show._id,
                hall: show.hall, // ✅ String hall
                price: show.showPrice
            });
        });
        
        res.json({success: true, movie, dateTime});
    } catch (error) {
        console.error(error);
        res.json({success: false, error: error.message});
    }
}
export const generateShow= async(req, res) => {
    try {
        const count = await autoShowService.manualGenerate('week')
        res.json({ 
            success: true, 
            message: `Generated ${count} shows for next week`,
            count 
        })
    } catch (error) {
        res.json({ 
            success: false, 
            message: 'Failed to generate shows',
            error: error.message 
        })
    }
}
export const generateShowTomorrow = async(req, res) => {
    try {
        const count = await autoShowService.manualGenerate('tomorrow')
        res.json({ 
            success: true, 
            message: `Generated ${count} shows for tomorrow`,
            count 
        })
    } catch (error) {
        res.json({ 
            success: false, 
            message: 'Failed to generate shows',
            error: error.message 
        })
    }
}
