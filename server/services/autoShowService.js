import cron from 'node-cron'
import Show from '../models/Show.js'
import Movie from '../models/Movie.js'
import axios from 'axios'

class AutoShowService {
    constructor() {
        this.isRunning = false
        this.availableHalls = ['Hall 1', 'Hall 2', 'Hall 3', 'Hall 4', 'Hall 5']
        this.showTimes = ['10:00', '13:30', '16:00', '19:30', '22:00']
        this.basePrices = [45, 55, 65, 75, 85] // Different price ranges
    }

    // ✅ Get random movies from TMDB
    async getRandomMovies(count = 10) {
        try {
            const randomPage = Math.floor(Math.random() * 5) + 1 // Random page 1-5
            const { data } = await axios.get(`https://api.themoviedb.org/3/movie/now_playing?page=${randomPage}`, {
                headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
            })
            
            // Shuffle and take random movies
            const shuffled = data.results.sort(() => 0.5 - Math.random())
            return shuffled.slice(0, count)
        } catch (error) {
            console.error('❌ Error fetching random movies:', error)
            return []
        }
    }

    // ✅ Create or update movie in database
    async ensureMovieExists(movieData) {
        try {
            let movie = await Movie.findById(movieData.id)
            
            if (!movie) {
                // Get detailed movie info including credits and videos
                const [movieDetailsResponse, movieCreditsResponse, movieVideosResponse] = await Promise.all([
                    axios.get(`https://api.themoviedb.org/3/movie/${movieData.id}`, {
                        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
                    }),
                    axios.get(`https://api.themoviedb.org/3/movie/${movieData.id}/credits`, {
                        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
                    }),
                    axios.get(`https://api.themoviedb.org/3/movie/${movieData.id}/videos`, {
                        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
                    })
                ])

                const movieDetails = movieDetailsResponse.data
                const movieCredits = movieCreditsResponse.data
                const movieVideos = movieVideosResponse.data

                // Process trailers
                const trailers = movieVideos.results
                    .filter(video => video.type === 'Trailer' && video.site === 'YouTube' && video.key)
                    .map(video => ({
                        key: video.key,
                        name: video.name,
                        type: video.type,
                        site: video.site,
                        size: video.size || 1080,
                        official: video.official || false,
                        published_at: video.published_at,
                        id: video.id,
                        youtube_url: `https://www.youtube.com/watch?v=${video.key}`,
                        embed_url: `https://www.youtube.com/embed/${video.key}`,
                        thumbnail_url: `https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`
                    }))
                    .sort((a, b) => b.official - a.official)
                    .slice(0, 5)

                // Process cast
                const cast = movieCredits.cast.slice(0, 10).map(person => ({
                    name: person.name,
                    character: person.character,
                    profile_path: person.profile_path
                }))

                const movieDetail = {
                    _id: movieDetails.id,
                    title: movieDetails.title,
                    overview: movieDetails.overview,
                    poster_path: movieDetails.poster_path,
                    backdrop_path: movieDetails.backdrop_path,
                    release_date: movieDetails.release_date,
                    genre_ids: movieDetails.genres.map(g => g.id),
                    vote_average: movieDetails.vote_average,
                    runtime: movieDetails.runtime || 120,
                    trailers: trailers,
                    cast: cast
                }

                movie = await Movie.create(movieDetail)
            }

            return movie
        } catch (error) {
            console.error('❌ Error ensuring movie exists:', error)
            return null
        }
    }

    // ✅ Generate shows for next week (7 days ahead)
    async generateShowsForNextWeek() {
        try {
            
            const movies = await this.getRandomMovies(10)
            if (movies.length === 0) {
                console.log('❌ No movies found for show generation')
                return
            }

            let totalShowsCreated = 0

            // Generate for next 7 days
            for (let daysAhead = 1; daysAhead <= 8; daysAhead++) {
                const targetDate = new Date()
                targetDate.setDate(targetDate.getDate() + daysAhead)
                targetDate.setHours(0, 0, 0, 0)


                // Randomly select 3-5 movies for this day
                const dailyMovieCount = Math.floor(Math.random() * 3) + 3 // 3-5 movies
                const selectedMovies = movies.sort(() => 0.5 - Math.random()).slice(0, dailyMovieCount)

                for (const movieData of selectedMovies) {
                    const movie = await this.ensureMovieExists(movieData)
                    if (!movie) continue

                    // Randomly assign hall and times
                    const randomHall = this.availableHalls[Math.floor(Math.random() * this.availableHalls.length)]
                    const randomTimeCount = Math.floor(Math.random() * 3) + 1 // 1-3 show times per movie
                    const selectedTimes = this.showTimes.sort(() => 0.5 - Math.random()).slice(0, randomTimeCount)
                    const randomPrice = this.basePrices[Math.floor(Math.random() * this.basePrices.length)]

                    for (const timeString of selectedTimes) {
                        const [hours, minutes] = timeString.split(':')
                        const showDateTime = new Date(targetDate)
                        showDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

                        // Check if show already exists
                        const existingShow = await Show.findOne({
                            movie: movie._id,
                            showDateTime: showDateTime,
                            hall: randomHall
                        })

                        if (!existingShow) {
                            await Show.create({
                                movie: movie._id,
                                showDateTime: showDateTime,
                                showPrice: randomPrice,
                                hall: randomHall,
                                occupiedSeats: {}
                            })
                            totalShowsCreated++
                        }
                    }
                }
            }

            console.log(`✅ Auto show generation completed! Created ${totalShowsCreated} shows`)
            return totalShowsCreated
        } catch (error) {
            console.error('❌ Error in auto show generation:', error)
        }
    }

    // ✅ Generate shows for tomorrow only (daily generation)
    async generateShowsForTomorrow() {
        try {
            
            const movies = await this.getRandomMovies(5) // Less movies for daily
            if (movies.length === 0) {
                console.log('❌ No movies found for daily show generation')
                return
            }

            let totalShowsCreated = 0
            const targetDate = new Date()
            targetDate.setDate(targetDate.getDate() + 7) // Always 7 days ahead
            targetDate.setHours(0, 0, 0, 0)

            console.log(`📅 Generating daily shows for: ${targetDate.toDateString()}`)

            // Select 2-3 movies for tomorrow
            const dailyMovieCount = Math.floor(Math.random() * 2) + 2 // 2-3 movies
            const selectedMovies = movies.slice(0, dailyMovieCount)

            for (const movieData of selectedMovies) {
                const movie = await this.ensureMovieExists(movieData)
                if (!movie) continue

                // Randomly assign hall and times
                const randomHall = this.availableHalls[Math.floor(Math.random() * this.availableHalls.length)]
                const randomTimeCount = Math.floor(Math.random() * 2) + 1 // 1-2 show times per movie
                const selectedTimes = this.showTimes.sort(() => 0.5 - Math.random()).slice(0, randomTimeCount)
                const randomPrice = this.basePrices[Math.floor(Math.random() * this.basePrices.length)]

                for (const timeString of selectedTimes) {
                    const [hours, minutes] = timeString.split(':')
                    const showDateTime = new Date(targetDate)
                    showDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

                    // Check if show already exists
                    const existingShow = await Show.findOne({
                        movie: movie._id,
                        showDateTime: showDateTime,
                        hall: randomHall
                    })

                    if (!existingShow) {
                        await Show.create({
                            movie: movie._id,
                            showDateTime: showDateTime,
                            showPrice: randomPrice,
                            hall: randomHall,
                            occupiedSeats: {}
                        })
                        totalShowsCreated++
                    }
                }
            }

            console.log(`✅ Daily auto show generation completed! Created ${totalShowsCreated} shows`)
            return totalShowsCreated
        } catch (error) {
            console.error('❌ Error in daily auto show generation:', error)
        }
    }

    // ✅ Start the cron job (runs every day at 2 AM)
    startAutoGeneration() {
        if (this.isRunning) {
            console.log('⚠️ Auto show generation is already running')
            return
        }

        // Run every day at 2:00 AM
        cron.schedule('0 2 * * *', async () => {
            console.log('🕐 Daily auto show generation triggered at 2:00 AM')
            await this.generateShowsForTomorrow()
        }, {
            timezone: "Asia/Ho_Chi_Minh" // Adjust to your timezone
        })

        this.isRunning = true
        console.log('✅ Auto show generation cron job started (runs daily at 2:00 AM)')
    }

    // ✅ Stop the cron job
    stopAutoGeneration() {
        this.isRunning = false
        console.log('🛑 Auto show generation stopped')
    }

    // ✅ Manual trigger for testing
    async manualGenerate(type = 'tomorrow') {
        if (type === 'week') {
            return await this.generateShowsForNextWeek()
        } else {
            return await this.generateShowsForTomorrow()
        }
    }
}

export default new AutoShowService()