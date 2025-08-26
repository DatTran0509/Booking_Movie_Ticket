import express from 'express';
import { getNowPlayingMovies, addShow, getShows, getShow, getShowPrice, getMovieRuntime} from '../controllers/showController.js';
import { protectAdmin } from '../middleware/auth.js';

const showRouter = express.Router();

showRouter.get('/now-playing', protectAdmin, getNowPlayingMovies);
showRouter.post('/add',protectAdmin, addShow);
showRouter.get('/all', getShows);
showRouter.get('/:movieId', getShow);
showRouter.get('/showprice/:showId', getShowPrice) 
showRouter.get('/movie-runtime/:movieId', protectAdmin, getMovieRuntime);
export default showRouter;