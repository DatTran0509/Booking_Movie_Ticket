import express from "express";
import { getFavorites, getUserBookings, updateFavorite } from "../controllers/userController.js";
import { requireAuthenticated } from "../middleware/auth.js";

const userRouter = express.Router()

userRouter.get('/bookings', requireAuthenticated, getUserBookings)
userRouter.post('/update-favorite', requireAuthenticated, updateFavorite)
userRouter.get('/favorites', requireAuthenticated, getFavorites)

export default userRouter
