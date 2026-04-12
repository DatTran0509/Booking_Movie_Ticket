import stripe from "stripe";
import { getPaymentHoldMinutes } from "../configs/env.js";
import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";

const releaseSeats = async (showId, selectedSeats) => {
    if (!showId || !selectedSeats?.length) {
        return;
    }

    const seatsToUnset = selectedSeats.reduce((accumulator, seat) => {
        accumulator[`occupiedSeats.${seat}`] = "";
        return accumulator;
    }, {});

    await Show.updateOne({ _id: showId }, { $unset: seatsToUnset });
};

export const createBooking = async (req, res) => {
    let bookingRecord = null;
    let reservedShow = null;

    try {
        const { userId } = req.auth();
        const { showId, selectedSeats } = req.body;
        const paymentHoldMinutes = getPaymentHoldMinutes();
        const clientUrl = process.env.CLIENT_URL.replace(/\/+$/, '');

        if (!showId) {
            return res.status(400).json({ success: false, message: "Show is required" });
        }

        if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
            return res.status(400).json({ success: false, message: "Please select at least one seat" });
        }

        if (!selectedSeats.every((seat) => typeof seat === 'string')) {
            return res.status(400).json({ success: false, message: "Selected seats are invalid" });
        }

        const trimmedSeats = selectedSeats.map((seat) => seat.trim()).filter(Boolean);

        if (trimmedSeats.length !== selectedSeats.length) {
            return res.status(400).json({ success: false, message: "Selected seats are invalid" });
        }

        const seatAvailabilityQuery = trimmedSeats.reduce((accumulator, seat) => {
            accumulator[`occupiedSeats.${seat}`] = { $exists: false };
            return accumulator;
        }, {});

        const seatAssignments = trimmedSeats.reduce((accumulator, seat) => {
            accumulator[`occupiedSeats.${seat}`] = userId;
            return accumulator;
        }, {});

        reservedShow = await Show.findOneAndUpdate(
            { _id: showId, ...seatAvailabilityQuery },
            { $set: seatAssignments },
            { new: true },
        ).populate('movie');

        if (!reservedShow) {
            return res.status(409).json({ success: false, message: "Selected seats are not available" });
        }

        bookingRecord = await Booking.create({
            user: userId,
            show: showId,
            amount: reservedShow.showPrice * trimmedSeats.length,
            bookedSeats: trimmedSeats,
        });

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        const lineItems = [{
            price_data: {
                currency: process.env.STRIPE_CURRENCY || 'usd',
                product_data: {
                    name: reservedShow.movie.title,
                },
                unit_amount: Math.floor(bookingRecord.amount) * 100,
            },
            quantity: 1,
        }];

        const session = await stripeInstance.checkout.sessions.create({
            line_items: lineItems,
            mode: 'payment',
            success_url: `${clientUrl}/loading/my-bookings`,
            cancel_url: `${clientUrl}/my-bookings`,
            metadata: {
                bookingId: bookingRecord._id.toString(),
            },
            expires_at: Math.floor(Date.now() / 1000) + (paymentHoldMinutes * 60),
        });

        bookingRecord.paymentLink = session.url;
        await bookingRecord.save();

        await inngest.send({
            name: 'app/checkpayment',
            data: {
                bookingId: bookingRecord._id.toString(),
            },
        });

        res.json({ success: true, url: session.url });
    } catch (error) {
        if (bookingRecord?._id) {
            await Booking.findByIdAndDelete(bookingRecord._id);
        }

        if (reservedShow?._id) {
            await releaseSeats(reservedShow._id, req.body?.selectedSeats || []);
        }

        console.log(error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getOccupiedSeats = async (req, res) => {
    try {
        const { showId } = req.params;
        const showData = await Show.findById(showId);

        if (!showData) {
            return res.status(404).json({ success: false, error: "Show not found" });
        }

        const occupiedSeats = Object.keys(showData.occupiedSeats);
        res.json({ success: true, occupiedSeats });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};
