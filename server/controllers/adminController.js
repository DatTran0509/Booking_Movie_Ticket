import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import Movie from "../models/Movie.js";

// API to check if user is admin
export const isAdmin = async (req, res) => {
    res.json({success: true, isAdmin: true});
}

// API to get dashboard data
export const getDashboardData = async (req, res) => {
    try {
        const bookings = await Booking.find({isPaid: true})
        
        // ✅ FIX: Populate full movie details thay vì chỉ movieId
        const activeShows = await Show.find({showDateTime: {$gte: new Date()}})
            .populate({
                path: 'movie',
                model: 'Movie',
                select: 'title poster_path backdrop_path overview genres release_date vote_average runtime' // ✅ Select specific fields
            })
            .sort({showDateTime: 1});
        
        const totalUser = await User.countDocuments();
    
        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((total, booking) => total + booking.amount, 0),
            activeShows,
            totalUser
        }
        
        res.json({success: true, dashboardData});
    } catch (error) {
        console.error('Dashboard error:', error);
        res.json({success: false, message: error.message});
    }
}

// API to get all shows
export const getAllShows = async (req, res) => {
    try {
        // ✅ Cũng fix luôn cho getAllShows
        const shows = await Show.find({showDateTime: {$gte: new Date()}})
            .populate({
                path: 'movie',
                model: 'Movie',
                select: 'title poster_path backdrop_path overview genres release_date vote_average runtime'
            })
            .sort({showDateTime: 1});
            
        res.json({success: true, shows});
    } catch (error) {
        console.error('Get shows error:', error);
        res.json({success: false, error: error.message});
    }
}

// API to get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({}).populate('user').populate('show').sort({createdAt: -1});
        res.json({success: true, bookings});
    } catch (error) {
        console.error(error);
        res.json({success: false, error: error.message});
    }
}