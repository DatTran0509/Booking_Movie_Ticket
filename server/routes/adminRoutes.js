import express from 'express';
import { protectAdmin } from '../middleware/auth.js';
import { getAllBookings, getAllShows, getDashboardData, isAdmin, getDashboardRevenue, getBookingsByMonth, getShowsByMonth, generateShow, generateShowTomorrow  } from '../controllers/adminController.js';

import autoShowService from '../services/autoShowService.js' // ✅ Import auto service

const adminRouter = express.Router();

adminRouter.get('/is-admin', protectAdmin, isAdmin);
adminRouter.get('/dashboard', protectAdmin, getDashboardData);
adminRouter.get('/all-shows', protectAdmin, getAllShows);
adminRouter.get('/all-bookings', protectAdmin, getAllBookings);
adminRouter.get('/dashboard-revenue', protectAdmin, getDashboardRevenue);
adminRouter.get('/bookings-by-month', protectAdmin, getBookingsByMonth)
adminRouter.get('/shows-by-month', protectAdmin, getShowsByMonth);
adminRouter.post('/generate-shows-weekly', protectAdmin, generateShow); 
adminRouter.post('/generate-shows-tomorrow', protectAdmin, generateShowTomorrow); 
export default adminRouter;
