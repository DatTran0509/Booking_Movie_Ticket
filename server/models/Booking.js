import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: { type: String, required: true, ref: "User" },
    show: { type: String, required: true, ref: "Show" },
    amount: { type: Number, required: true },
    bookedSeats: {type: Array, required: true},
    isPaid: { type: Boolean, default: false },
    paymentLink: { type: String},
    // ✅ Add new fields for better tracking
    paymentIntentId: {
        type: String,
        default: ""
    },
    
}, { timestamps: true });
const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;