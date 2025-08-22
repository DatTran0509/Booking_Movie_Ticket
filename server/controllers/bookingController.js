import Booking from "../models/Booking.js";
import Show from "../models/Show.js"
import stripe from "stripe";
// Function to check availability of selected seats for a movie
const checkSeatAvailability = async(showId, selectedSeats) => {
    try {
        const showData = await Show.findById(showId)
        if (!showData) {
            return false;
        }
        const occupiedSeats = showData.occupiedSeats;
        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat] );
        return !isAnySeatTaken;
    } catch (error) {
        console.log(error.message);
        return false
    }
}
export const createBooking = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {showId, selectedSeats} = req.body;
        const {origin} = req.headers;

        // Check if the seat is available for the selected show
        const isAvailable = await checkSeatAvailability(showId, selectedSeats);
        if(!isAvailable){
            return res.json({success: false, message: "Selected seats are not available"});
        }
        // Get the show details
        const showData = await Show.findById(showId).populate('movie');
        // Create new booking

        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats,
            
        });
        selectedSeats.map((seat) => {
            showData.occupiedSeats[seat] = userId;
        })
        showData.markModified('occupiedSeats');
        await showData.save();

        // Stripe Gateway Initialization
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        // Creating line itmes to be passed to Stripe
        const line_items = [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: showData.movie.title,
                },
                unit_amount: Math.floor(booking.amount)*100 // Amount in cents
            },
            quantity: 1
        }]

        const sessioni = await stripeInstance.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            success_url: `${origin}/loading/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            metadata: {
                bookingId: booking._id.toString(),
            },
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60 ) // 30 minutes
        });
        booking.paymentLink = sessioni.url;
        await booking.save();

        res.json({success: true, url: sessioni.url});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, error: error.message});
    }
}

export const getOccupiedSeats = async (req, res) => {
    try {
        const {showId} = req.params;
        const showData = await Show.findById(showId)
        const occupiedSeats = Object.keys(showData.occupiedSeats)
        res.json({success: true, occupiedSeats});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, error: error.message});
        
    }
}