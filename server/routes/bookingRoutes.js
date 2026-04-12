import express from 'express';
import { createBooking, getOccupiedSeats  } from '../controllers/bookingController.js';
import { requireAuthenticated } from '../middleware/auth.js';

const bookingRouter = express.Router();

bookingRouter.post('/create', requireAuthenticated, createBooking);
bookingRouter.get('/seats/:showId', getOccupiedSeats);


export default bookingRouter;
