import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

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
        const {movieId, showsInput, showPrice} = req.body;
        if (!movieId || !showsInput || !showPrice) {
            return res.json({success: false, error: "All fields are required"});
        }
        let movie = await Movie.findById(movieId);
        if(!movie) {
            // fetch movie details and credits from TMDB API
            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
                    headers: {Authorization: `Bearer ${process.env.TMDB_API_KEY}`},
                }),
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
                    headers: {Authorization: `Bearer ${process.env.TMDB_API_KEY}`},
                })
            ]);
            const movieApiData = movieDetailsResponse.data;
            const movieCreditsData = movieCreditsResponse.data;

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
            };
            // Add movie to the database
            movie = await Movie.create(movieDetail);
        }
        const showsToCreate = [];
        showsInput.forEach(show => {
            const showDate = show.date;
            show.times.forEach((time) => {
                const dateTimeString = `${showDate}T${time}`;
                showsToCreate.push({
                    movie: movieId,
                    showDateTime: new Date(dateTimeString),
                    showPrice,
                    occupiedSeats: {}
                })
            })
        });
        if(showsToCreate.length > 0) {
            await Show.insertMany(showsToCreate);
        }
        
        res.json({success: true, message: "Shows added successfully"});


    } catch (error) {
        console.error(error);
        res.json({success: false, error: error.message});
    }
}

// API to get all shows of a movie
export const getShows = async (req, res) => {
    try {
        const shows = await Show.find({showDateTime: {$gte: new Date()}}).populate('movie').sort({showDateTime: 1});

        //filter unique show
        const uniqueShows = new Set(shows.map(show => show.movie))  
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
            dateTime[date].push({time: show.showDateTime, showId: show._id}); // Get the time part in HH:MM format
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