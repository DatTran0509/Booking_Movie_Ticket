import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

// ✅ Helper function to check time conflicts with movie runtime
const checkTimeConflicts = async (hall, showDateTime, movieRuntime, excludeShowId = null) => {
    const showTime = new Date(showDateTime);
    const bufferTime = 30 * 60 * 1000; // 30 minutes buffer in milliseconds
    const movieDuration = (movieRuntime || 120) * 60 * 1000; // Convert minutes to milliseconds
    
    // Total time needed = movie duration + 30 min buffer
    const totalTimeNeeded = movieDuration + bufferTime;
    
    // Check for overlapping shows in the same hall
    const conflictingShows = await Show.find({
        hall: hall,
        _id: { $ne: excludeShowId }, // Exclude current show if updating
        showDateTime: {
            // Check if any existing show conflicts with our time slot
            $gte: new Date(showTime.getTime() - totalTimeNeeded), // Shows that start before our end time
            $lte: new Date(showTime.getTime() + totalTimeNeeded)  // Shows that end after our start time
        }
    }).populate('movie');
    
    // Additional check: ensure exact timing
    for (const existingShow of conflictingShows) {
        const existingShowTime = new Date(existingShow.showDateTime);
        const existingMovieRuntime = existingShow.movie?.runtime || 120;
        const existingTotalTime = (existingMovieRuntime * 60 * 1000) + bufferTime;
        
        // Check if shows overlap
        const newShowEnd = showTime.getTime() + totalTimeNeeded;
        const existingShowEnd = existingShowTime.getTime() + existingTotalTime;
        
        if (
            (showTime.getTime() >= existingShowTime.getTime() && showTime.getTime() < existingShowEnd) ||
            (existingShowTime.getTime() >= showTime.getTime() && existingShowTime.getTime() < newShowEnd)
        ) {
            return {
                hasConflict: true,
                conflictingShow: existingShow,
                message: `Conflict with existing show at ${existingShowTime.toLocaleString()}. Shows need ${(totalTimeNeeded / 60000).toFixed(0)} minutes gap (${movieRuntime}min movie + 30min buffer).`
            };
        }
    }
    
    return { hasConflict: false };
};

// API to ger now playing movies from TMBD API
export const getNowPlayingMovies = async (req, res) => {
    try {
        const {data} = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
            headers:{Authorization: `Bearer ${process.env.TMDB_API_KEY}`},
        })
        const movies = data.results;
        res.json({success: true, movies: movies});
    } catch (error) {
        console.error(error);
        res.json({success: false, error: error.message});
    }
}

// API to add a new show to the database

export const addShow = async (req, res) => {
    try {
        const { movieId, showsInput, showPrice, hall } = req.body;

        // ✅ Validate hall
        if (!hall || typeof hall !== 'string' || hall.trim() === '') {
            return res.json({success: false, message: "Hall selection is required"});
        }

        // ✅ Get movie details first to check runtime
        let movie = await Movie.findById(movieId);
        
        if (!movie) {
            // ✅ Fetch movie details, credits AND videos
            const [movieDetailsResponse, movieCreditsResponse, movieVideosResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
                    headers: {Authorization: `Bearer ${process.env.TMDB_API_KEY}`},
                }),
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
                    headers: {Authorization: `Bearer ${process.env.TMDB_API_KEY}`},
                }),
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos`, {
                    headers: {Authorization: `Bearer ${process.env.TMDB_API_KEY}`},
                })
            ]);
            
            const movieApiData = movieDetailsResponse.data;
            const movieCreditsData = movieCreditsResponse.data;
            const movieVideosData = movieVideosResponse.data;

            // ✅ Process trailers - get all YouTube trailers
            const videos = movieVideosData.results || [];
            const trailers = videos
                .filter(video => 
                    video.type === 'Trailer' && 
                    video.site === 'YouTube' &&
                    video.key // Ensure video has valid key
                )
                .map(video => ({
                    key: video.key,
                    name: video.name,
                    type: video.type,
                    site: video.site,
                    size: video.size || 1080,
                    official: video.official || false,
                    published_at: video.published_at,
                    id: video.id,
                    // ✅ Generate URLs for different purposes
                    youtube_url: `https://www.youtube.com/watch?v=${video.key}`,
                    embed_url: `https://www.youtube.com/embed/${video.key}`,
                    thumbnail_url: `https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`
                }))
                .sort((a, b) => {
                    // ✅ Sort by: Official first, then by date, then by size
                    if (a.official !== b.official) return b.official - a.official;
                    if (a.published_at !== b.published_at) {
                        return new Date(b.published_at) - new Date(a.published_at);
                    }
                    return b.size - a.size;
                });

            // console.log(`🎬 Found ${trailers.length} trailers for ${movieApiData.title}`);

            const movieDetail = {
                _id: movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                genres: movieApiData.genres,
                casts: movieCreditsData.cast,
                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline,
                vote_average: movieApiData.vote_average,
                runtime: movieApiData.runtime,
                // ✅ Only trailers array needed
                trailers: trailers
            };
            
            movie = await Movie.create(movieDetail);
        }

        const movieRuntime = movie.runtime || 120; // Default 2 hours if no runtime

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
            const conflictCheck = await checkTimeConflicts(hall, showTime, movieRuntime);
            if (conflictCheck.hasConflict) {
                return res.json({
                    success: false, 
                    message: conflictCheck.message
                });
            }
        }

        // Check for conflicts within the new shows being added
        const sortedTimes = allShowTimes.sort((a, b) => a - b);
        const requiredGap = (movieRuntime + 30) * 60 * 1000; // Movie runtime + 30 min in milliseconds
        
        for (let i = 1; i < sortedTimes.length; i++) {
            const timeDiff = sortedTimes[i] - sortedTimes[i-1];
            if (timeDiff < requiredGap) {
                const requiredGapMinutes = Math.ceil(requiredGap / 60000);
                return res.json({
                    success: false,
                    message: `Shows in ${hall} must be at least ${requiredGapMinutes} minutes apart (${movieRuntime}min movie + 30min buffer). Conflict between ${sortedTimes[i-1].toLocaleString()} and ${sortedTimes[i].toLocaleString()}`
                });
            }
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
                    hall,
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

// ✅ Add endpoint to get movie runtime for frontend validation
export const getMovieRuntime = async (req, res) => {
    try {
        const { movieId } = req.params;
        
        let movie = await Movie.findById(movieId);
        
        if (!movie) {
            // Fetch from API if not in database
            const [movieDetailsResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
                    headers: {Authorization: `Bearer ${process.env.TMDB_API_KEY}`},
                }),
            ]);
            const movieApiData = movieDetailsResponse.data;
           
            
            return res.json({
                success: true, 
                runtime: movieApiData.runtime || 120,
                title: movieApiData.title
            });
        }
        
        res.json({
            success: true, 
            runtime: movie.runtime || 120,
            title: movie.title
        });
        
    } catch (error) {
        console.error(error);
        res.json({success: false, runtime: 120}); // Default runtime
    }
}

// API to get all shows of a movie
export const getShows = async (req, res) => {
    try {
        const shows = await Show.find({showDateTime: {$gte: new Date()}})
            .populate('movie')
            .sort({hall: 1, showDateTime: 1});

        const uniqueShows = new Set(shows.map(show => show.movie));  
        res.json({success: true, shows: Array.from(uniqueShows)});
    } catch (error) {
        console.error(error);
        res.json({success: false, error: error.message});
    }
}

// API to get a singhle show from the database
export const getShow = async (req, res) => {
    try {
        const {movieId} = req.params;
        if (!movieId) {
            return res.json({success: false, error: "Movie ID is required"});
        }
        // gel all upcoming shows of a movie
        const shows = await Show.find({movie: movieId, showDateTime: {$gte: new Date()}})   

        const movie = await Movie.findById(movieId);
        const dateTime = {}
        const showPrice = 0
        shows.forEach((show) => {
            const date = show.showDateTime.toISOString().split('T')[0]; // Get the date part in YYYY-MM-DD format
            // showPrice = show.showPrice;
            if (!dateTime[date]) {  
                dateTime[date] = [];
            }
            dateTime[date].push({time: show.showDateTime, showId: show._id, hall: show.hall}); // Get the time part in HH:MM format
        })
        res.json({success: true, movie, dateTime});
    } catch (error) {
        console.error(error);
        res.json({success: false, error: error.message});
        
    }
}

// API to get show price by showId
export const getShowPrice = async (req, res) => {
    try {
      const { showId } = req.params
      
      const show = await Show.findById(showId)
      if (!show) {
        return res.json({ success: false, message: 'Show not found' })
      }
      
      res.json({ 
        success: true, 
        showPrice: show.showPrice,
        showId: show._id,
        movieTitle: show.movie?.title || 'Unknown Movie'
      })
    } catch (error) {
      console.error('Get show price error:', error)
      res.json({ success: false, message: error.message })
    }
  }

export const getShowsByMonth = async (req, res) => {
    try {
        const { month, year } = req.query;
        
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, parseInt(month) + 1, 0, 23, 59, 59);
        
        const shows = await Show.find({
            showDateTime: {
                $gte: startDate,
                $lte: endDate
            }
        }).populate('movie').sort({ hall: 1, showDateTime: 1 });
        
        res.json({ success: true, shows });
    } catch (error) {
        res.json({ success: false, message: 'Server error' });
    }
}
