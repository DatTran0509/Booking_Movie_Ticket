import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";
// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest Function to save user data to database
const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async({event}) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;
        const userData ={
            _id: id,
            name: `${first_name} ${last_name}`,
            email: email_addresses[0].email_address,
            image: image_url
        }
        await User.create(userData)
    }
   
)
// inngest Function to delete user from database
const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-with-clerk'},
    {event: 'clerk/user.deleted'},
    async({event}) => {
        const {id} = event.data;
        await User.findByIdAndDelete(id);

    }
)

// inngest Function to update user data in database
const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async({event}) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;
        const userData ={
            _id: id,
            name: `${first_name} ${last_name}`,
            email: email_addresses[0].email_address,
            image: image_url
        }
        await User.findByIdAndUpdate(id, userData);
    }
)
// Inngest Function to cancel bôking and release seats of show after 10 minutes of booking if payment is not made
const releaseSeatsAndDeleteBooking = inngest.createFunction(
    {id: 'release-seats-and-delete-booking'},
    {event: 'app/checkpayment'},
    async ({event, step}) => {
        const tenMinutesLater = new Date(Date.now() + 1 * 60 * 1000);
        await step.sleepUntil('wait-for-10-minutes',tenMinutesLater);

        await step.run('check-payment-status', async () => {
            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId)

            // If payment is not made, release seats and delete booking
            if(!booking.isPaid){
                const show = await Show.findById(booking.show);
                booking.bookedSeats.forEeach((seat) => {
                    delete show.occupiedSeats[seat];
                })
                show.markModified('occupiedSeats');
                await show.save();
                await Booking.findByIdAndDelete(booking._id);
            }
        })
    }
)
const sendBookingConfirmationEmail = inngest.createFunction(
    {id: 'send-booking-confirmation-email'},
    {event: 'app/booking.booked'},
    async ({event, step}) => {
        const {bookingId} = event.data;
        
        try {
            const booking = await Booking.findById(bookingId).populate({
                path: 'show',
                populate: {path: 'movie', model: 'Movie'}
            }).populate('user');

            if (!booking) {
                console.log('Booking not found for email:', bookingId);
                return;
            }

            // ✅ Complete email body template
            const emailBody = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; background-color: #1a1a1a; color: #ffffff; border-radius: 12px; overflow: hidden;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎬 QuickShow</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your Cinema Experience Awaits</p>
                </div>

                <!-- Content -->
                <div style="padding: 30px;">
                    <h2 style="color: #6366f1; margin: 0 0 20px 0; font-size: 24px;">Hi ${booking.user.name}! 👋</h2>
                    
                    <p style="font-size: 18px; margin: 0 0 25px 0;">
                        Your booking for <strong style="color: #f84565;">${booking.show.movie.title}</strong> is confirmed! 🎉
                    </p>

                    <!-- Movie Details Card -->
                    <div style="background-color: #2d2d2d; border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #6366f1;">
                        <h3 style="color: #6366f1; margin: 0 0 15px 0; font-size: 20px;">🎭 Booking Details</h3>
                        
                        <div style="display: grid; gap: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #404040;">
                                <span style="color: #9ca3af;">🎬 Movie:</span>
                                <strong style="color: #ffffff;">${booking.show.movie.title}</strong>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #404040;">
                                <span style="color: #9ca3af;">📅 Date:</span>
                                <strong style="color: #ffffff;">${new Date(booking.show.showDateTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #404040;">
                                <span style="color: #9ca3af;">⏰ Time:</span>
                                <strong style="color: #ffffff;">${new Date(booking.show.showDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</strong>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #404040;">
                                <span style="color: #9ca3af;">🎫 Seats:</span>
                                <strong style="color: #10b981;">${booking.selectedSeats.join(', ')}</strong>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #404040;">
                                <span style="color: #9ca3af;">👥 Total Tickets:</span>
                                <strong style="color: #ffffff;">${booking.selectedSeats.length}</strong>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; background-color: #374151; border-radius: 8px; padding: 15px; margin-top: 10px;">
                                <span style="color: #9ca3af; font-size: 16px;">💰 Total Amount:</span>
                                <strong style="color: #10b981; font-size: 20px;">$${booking.amount}</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Important Notes -->
                    <div style="background-color: #1f2937; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #374151;">
                        <h4 style="color: #f59e0b; margin: 0 0 10px 0;">⚠️ Important Notes:</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #d1d5db;">
                            <li>Please arrive 15 minutes before show time</li>
                            <li>Carry a valid ID for verification</li>
                            <li>Outside food and beverages are not allowed</li>
                            <li>Mobile phones should be on silent mode</li>
                        </ul>
                    </div>

                    <!-- QR Code Placeholder -->
                    <div style="text-align: center; margin: 25px 0;">
                        <div style="background-color: #2d2d2d; border-radius: 12px; padding: 25px; display: inline-block;">
                            <p style="color: #9ca3af; margin: 0 0 10px 0;">Your Booking ID:</p>
                            <div style="background-color: #000; color: #10b981; font-family: monospace; font-size: 18px; font-weight: bold; padding: 15px; border-radius: 8px; letter-spacing: 2px;">
                                ${booking._id.toString().toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <p style="margin: 25px 0 0 0; font-size: 16px;">
                        Enjoy the show! 🍿🎬<br/>
                        <strong>Thanks for booking with us!</strong>
                    </p>
                </div>

                <!-- Footer -->
                <div style="background-color: #111827; padding: 20px; text-align: center; border-top: 1px solid #374151;">
                    <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                        Need help? Contact us at 
                        <a href="mailto:support@quickshow.com" style="color: #6366f1; text-decoration: none;">support@quickshow.com</a>
                    </p>
                    <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
                        © 2025 QuickShow Team. All rights reserved.
                    </p>
                </div>
            </div>
            `;

            await sendEmail({
                to: booking.user.email,
                subject: `🎬 Booking Confirmation: ${booking.show.movie.title} - Seat${booking.selectedSeats.length > 1 ? 's' : ''} ${booking.selectedSeats.join(', ')}`,
                body: emailBody
            });

            console.log(`Confirmation email sent to ${booking.user.email} for booking ${bookingId}`);
        } catch (error) {
            console.error('Error sending booking confirmation email:', error);
        }
    }
);

// ✅ Export all functions including the email function
export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    releaseSeatsAndDeleteBooking,
    sendBookingConfirmationEmail // ✅ Add email function to exports
];