import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe, getLevelPrice, CURRENCY } from '../lib/stripe';
import PaymentModel from '../models/payment';
import UserModel from '../models/user';
import { ApiResponse } from '../types/api';

export class PaymentController {
    // Create Stripe Checkout Session for a specific level
    static async createCheckoutSession(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { level } = req.body;

            if (!userId) {
                const response: ApiResponse = {
                    success: false,
                    message: "User not authenticated"
                };
                res.status(401).json(response);
                return;
            }

            // Validate level
            if (!level || ![2, 3, 4].includes(level)) {
                const response: ApiResponse = {
                    success: false,
                    message: "Invalid level. Only levels 2, 3, and 4 require payment."
                };
                res.status(400).json(response);
                return;
            }

            // Get user
            const user = await UserModel.findById(userId);
            if (!user) {
                const response: ApiResponse = {
                    success: false,
                    message: "User not found"
                };
                res.status(404).json(response);
                return;
            }

            // Check if user already purchased this level
            const levelKey = `level${level}` as 'level2' | 'level3' | 'level4';
            if (user.purchasedLevels[levelKey].purchased) {
                const response: ApiResponse = {
                    success: false,
                    message: `You have already purchased Level ${level}`
                };
                res.status(400).json(response);
                return;
            }

            // NOTE: Removed previous level completion check - users can purchase any level anytime

            // Get price for the level
            const priceInCents = getLevelPrice(level);
            if (!priceInCents) {
                const response: ApiResponse = {
                    success: false,
                    message: "Price not configured for this level"
                };
                res.status(500).json(response);
                return;
            }

            // Create Stripe Checkout Session with bundle description
            let productName = `LifeScore Level ${level} Access`;
            let productDescription = `One-time purchase to unlock Level ${level} assessment`;
            
            // Add bundle description for Level 3 and 4
            if (level === 3) {
                productName = `LifeScore Levels 2 & 3 Bundle`;
                productDescription = `Unlock both Level 2 and Level 3 assessments`;
            } else if (level === 4) {
                productName = `LifeScore Complete Bundle (Levels 2, 3 & 4)`;
                productDescription = `Unlock all premium assessments: Levels 2, 3, and 4`;
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: CURRENCY,
                            product_data: {
                                name: productName,
                                description: productDescription,
                            },
                            unit_amount: priceInCents,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.CLIENT_URL}/user/payment/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.CLIENT_URL}/user/payment/cancel`,
                client_reference_id: userId,
                metadata: {
                    userId,
                    level: level.toString(),
                },
            });

            // Save payment record
            await PaymentModel.create({
                userId,
                level,
                amount: priceInCents,
                currency: CURRENCY,
                stripeSessionId: session.id,
                status: 'pending',
            });

            const response: ApiResponse = {
                success: true,
                message: "Checkout session created successfully",
                data: {
                    sessionId: session.id,
                    url: session.url,
                }
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error creating checkout session:", error);
            const response: ApiResponse = {
                success: false,
                message: "Failed to create checkout session"
            };
            res.status(500).json(response);
        }
    }

    // Verify payment after redirect from Stripe
    static async verifyPayment(req: Request, res: Response): Promise<void> {
        try {
            const { sessionId } = req.body;

            if (!sessionId) {
                const response: ApiResponse = {
                    success: false,
                    message: "Session ID is required"
                };
                res.status(400).json(response);
                return;
            }

            // Retrieve session from Stripe
            const session = await stripe.checkout.sessions.retrieve(sessionId);

            if (!session) {
                const response: ApiResponse = {
                    success: false,
                    message: "Invalid session"
                };
                res.status(404).json(response);
                return;
            }

            // Get payment record
            const payment = await PaymentModel.findOne({ stripeSessionId: sessionId });

            if (!payment) {
                const response: ApiResponse = {
                    success: false,
                    message: "Payment record not found"
                };
                res.status(404).json(response);
                return;
            }

            // Check if payment is already completed
            if (payment.status === 'completed') {
                const response: ApiResponse = {
                    success: true,
                    message: "Payment already verified",
                    data: {
                        level: payment.level,
                        status: payment.status
                    }
                };
                res.status(200).json(response);
                return;
            }

            // Check payment status
            if (session.payment_status === 'paid') {
                // Update payment record
                payment.status = 'completed';
                payment.stripePaymentIntentId = session.payment_intent as string;
                await payment.save();

                // Update user's purchased levels - unlock bundle based on purchased level
                const user = await UserModel.findById(payment.userId);
                if (user) {
                    // Determine which levels to unlock based on purchase
                    const levelsToUnlock: Array<2 | 3 | 4> = [];
                    if (payment.level === 2) {
                        levelsToUnlock.push(2);
                    } else if (payment.level === 3) {
                        levelsToUnlock.push(2, 3);
                    } else if (payment.level === 4) {
                        levelsToUnlock.push(2, 3, 4);
                    }

                    // Unlock all levels in the bundle
                    levelsToUnlock.forEach(level => {
                        const levelKey = `level${level}` as 'level2' | 'level3' | 'level4';
                        if (!user.purchasedLevels[levelKey].purchased) {
                            user.purchasedLevels[levelKey].purchased = true;
                            user.purchasedLevels[levelKey].purchaseDate = new Date();
                            user.purchasedLevels[levelKey].paymentId = (payment._id as string).toString();
                        }
                    });
                    
                    // Unlock highest level purchased (for UI purposes)
                    const highestPurchasedLevel = Math.max(...levelsToUnlock);
                    user.progress.highestUnlockedLevel = Math.max(
                        user.progress.highestUnlockedLevel, 
                        highestPurchasedLevel
                    );
                    
                    await user.save();
                }

                const response: ApiResponse = {
                    success: true,
                    message: `Level ${payment.level} unlocked successfully!`,
                    data: {
                        level: payment.level,
                        status: payment.status,
                        purchaseDate: payment.updatedAt
                    }
                };
                res.status(200).json(response);
            } else {
                payment.status = 'failed';
                await payment.save();

                const response: ApiResponse = {
                    success: false,
                    message: "Payment was not successful"
                };
                res.status(400).json(response);
            }

        } catch (error) {
            console.error("Error verifying payment:", error);
            const response: ApiResponse = {
                success: false,
                message: "Failed to verify payment"
            };
            res.status(500).json(response);
        }
    }

    // Stripe Webhook Handler
    static async handleWebhook(req: Request, res: Response): Promise<void> {
        const sig = req.headers['stripe-signature'] as string;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error('Webhook secret not configured');
            res.status(500).send('Webhook secret not configured');
            return;
        }

        let event: Stripe.Event;

        try {
            // Verify webhook signature
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err.message);
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        // Handle the event
        try {
            switch (event.type) {
                case 'checkout.session.completed':
                    const session = event.data.object as Stripe.Checkout.Session;
                    await PaymentController.handleCheckoutComplete(session);
                    break;

                case 'payment_intent.succeeded':
                    const paymentIntent = event.data.object as Stripe.PaymentIntent;
                    console.log('PaymentIntent succeeded:', paymentIntent.id);
                    break;

                case 'payment_intent.payment_failed':
                    const failedPayment = event.data.object as Stripe.PaymentIntent;
                    await PaymentController.handlePaymentFailed(failedPayment);
                    break;

                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            res.json({ received: true });

        } catch (error) {
            console.error('Error handling webhook:', error);
            res.status(500).json({ error: 'Webhook handler failed' });
        }
    }

    // Helper: Handle checkout completion
    private static async handleCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
        const payment = await PaymentModel.findOne({ stripeSessionId: session.id });

        if (!payment) {
            console.error('Payment not found for session:', session.id);
            return;
        }

        if (payment.status === 'completed') {
            console.log('Payment already processed:', payment._id);
            return;
        }

        // Update payment
        payment.status = 'completed';
        payment.stripePaymentIntentId = session.payment_intent as string;
        await payment.save();

        // Update user - unlock bundle based on purchased level
        const user = await UserModel.findById(payment.userId);
        if (user) {
            // Determine which levels to unlock based on purchase
            const levelsToUnlock: Array<2 | 3 | 4> = [];
            if (payment.level === 2) {
                levelsToUnlock.push(2);
            } else if (payment.level === 3) {
                levelsToUnlock.push(2, 3);
            } else if (payment.level === 4) {
                levelsToUnlock.push(2, 3, 4);
            }

            // Unlock all levels in the bundle
            levelsToUnlock.forEach(level => {
                const levelKey = `level${level}` as 'level2' | 'level3' | 'level4';
                if (!user.purchasedLevels[levelKey].purchased) {
                    user.purchasedLevels[levelKey].purchased = true;
                    user.purchasedLevels[levelKey].purchaseDate = new Date();
                    user.purchasedLevels[levelKey].paymentId = (payment._id as string).toString();
                }
            });
            
            // Unlock highest level purchased
            const highestPurchasedLevel = Math.max(...levelsToUnlock);
            user.progress.highestUnlockedLevel = Math.max(
                user.progress.highestUnlockedLevel, 
                highestPurchasedLevel
            );
            
            await user.save();
            console.log(`Levels ${levelsToUnlock.join(', ')} unlocked for user ${user._id}`);
        }
    }

    // Helper: Handle payment failure
    private static async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
        const payment = await PaymentModel.findOne({ 
            stripePaymentIntentId: paymentIntent.id 
        });

        if (payment) {
            payment.status = 'failed';
            await payment.save();
            console.log('Payment failed:', payment._id);
        }
    }

    // Get user's payment history
    static async getPaymentHistory(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                const response: ApiResponse = {
                    success: false,
                    message: "User not authenticated"
                };
                res.status(401).json(response);
                return;
            }

            const payments = await PaymentModel.find({ userId }).sort({ createdAt: -1 });

            const response: ApiResponse = {
                success: true,
                message: "Payment history retrieved successfully",
                data: payments
            };

            res.status(200).json(response);

        } catch (error) {
            console.error("Error fetching payment history:", error);
            const response: ApiResponse = {
                success: false,
                message: "Failed to fetch payment history"
            };
            res.status(500).json(response);
        }
    }
}
