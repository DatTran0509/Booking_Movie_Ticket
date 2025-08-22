import Stripe from 'stripe'
import Booking from '../models/Booking.js';

export const stripeWebhooks = async (req, res) => {
    console.log('🔗 Webhook received:', new Date().toISOString());
    
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
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log('✅ Webhook event verified:', event.type);
    } catch (error) {
        console.error('❌ Webhook signature verification failed:', error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        switch (event.type) {
            // ✅ Handle payment_intent.succeeded - when payment is actually completed
            case "payment_intent.succeeded":
                {
                    console.log('💰 Processing payment_intent.succeeded');
                    const paymentIntent = event.data.object;
                    console.log('💰 Payment Intent ID:', paymentIntent.id);
                    
                    // Get the checkout session associated with this payment intent
                    const sessions = await stripe.checkout.sessions.list({
                        payment_intent: paymentIntent.id,
                    });

                    console.log('📋 Sessions found:', sessions.data.length);

                    if (sessions.data.length === 0) {
                        console.log('❌ No checkout session found for payment intent');
                        break;
                    }

                    const session = sessions.data[0];
                    const { bookingId } = session.metadata || {};
                    
                    console.log('🎫 Session ID:', session.id);
                    console.log('🎫 Booking ID from metadata:', bookingId);
                    console.log('📊 Metadata:', session.metadata);

                    if (!bookingId) {
                        console.log('❌ No bookingId in metadata');
                        break;
                    }

                    const booking = await Booking.findById(bookingId);
                    
                    if (!booking) {
                        console.log('❌ Booking not found:', bookingId);
                        break;
                    }

                    // ✅ Check if already paid to avoid duplicate updates
                    if (booking.isPaid) {
                        console.log('ℹ️ Booking already marked as paid:', bookingId);
                        break;
                    }

                    console.log('📝 Booking before update:', {
                        id: booking._id,
                        isPaid: booking.isPaid,
                        amount: booking.amount,
                        selectedSeats: booking.selectedSeats
                    });

                    // ✅ Update booking status
                    const updatedBooking = await Booking.findByIdAndUpdate(
                        bookingId,
                        {
                            isPaid: true,
                            paymentLink: "",
                            paymentIntentId: paymentIntent.id,
                            stripeSessionId: session.id,
                            paidAt: new Date()
                        },
                        { new: true }
                    );

                    console.log('✅ Booking updated successfully:', {
                        id: updatedBooking._id,
                        isPaid: updatedBooking.isPaid,
                        paidAt: updatedBooking.paidAt,
                        paymentIntentId: updatedBooking.paymentIntentId
                    });

                    break;
                }

            case "checkout.session.completed":
                {
                    console.log('🛒 Checkout session completed - waiting for payment_intent.succeeded');
                    const session = event.data.object;
                    console.log('🎫 Session:', session.id, 'Payment Status:', session.payment_status);
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