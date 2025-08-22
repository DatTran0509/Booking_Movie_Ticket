import Stripe from 'stripe'
import Booking from '../models/Booking.js';

export const stripeWebhooks = async (req, res) => {
    console.log('🔗 Webhook received:', new Date().toISOString());
    
    // ✅ Fix parameter names để tránh conflict
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig) {
        console.log('❌ No stripe signature found');
        return res.status(400).send('No stripe signature');
    }

    if (!endpointSecret) {
        console.log('❌ No webhook secret configured');
        return res.status(400).send('Webhook secret not configured');
    }

    let event;
    try {
        // ✅ Use req.body instead of request.body
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log('✅ Webhook event verified:', event.type);
    } catch (error) {
        console.error('❌ Webhook signature verification failed:', error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        switch (event.type) {
            // ✅ Change to checkout.session.completed (more reliable)
            case "checkout.session.completed":
                {
                    console.log('🛒 Processing checkout.session.completed');
                    const session = event.data.object;
                    const { bookingId } = session.metadata || {};
                    
                    console.log('🎫 Session ID:', session.id);
                    console.log('🎫 Payment Status:', session.payment_status);
                    console.log('🎫 Booking ID:', bookingId);
                    console.log('📊 Metadata:', session.metadata);

                    if (!bookingId) {
                        console.log('❌ No bookingId in metadata');
                        return res.status(400).json({ error: 'No booking ID found' });
                    }

                    // ✅ Only process if payment was successful
                    if (session.payment_status === 'paid') {
                        const booking = await Booking.findById(bookingId);
                        
                        if (!booking) {
                            console.log('❌ Booking not found:', bookingId);
                            return res.status(404).json({ error: 'Booking not found' });
                        }

                        console.log('📝 Booking before update:', {
                            id: booking._id,
                            isPaid: booking.isPaid,
                            amount: booking.amount
                        });

                        // ✅ Update booking status
                        const updatedBooking = await Booking.findByIdAndUpdate(
                            bookingId,
                            {
                                isPaid: true,
                                paymentLink: "",
                                stripeSessionId: session.id,
                                paidAt: new Date()
                            },
                            { new: true }
                        );

                        console.log('✅ Booking updated successfully:', {
                            id: updatedBooking._id,
                            isPaid: updatedBooking.isPaid,
                            paidAt: updatedBooking.paidAt
                        });
                    } else {
                        console.log('⚠️ Payment not completed:', session.payment_status);
                    }

                    break;
                }

            case "payment_intent.succeeded":
                {
                    console.log('💰 Payment intent succeeded - already handled by checkout.session.completed');
                    break;
                }
                
            default:
                console.log(`⚠️ Unhandled event type: ${event.type}`);
                break;
        }
        
        console.log('✅ Webhook processed successfully');
        res.status(200).json({ received: true });
        
    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        console.error('Error stack:', error.stack);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}