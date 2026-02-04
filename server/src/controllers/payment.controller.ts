import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe, getLevelPrice, CURRENCY } from "../lib/stripe";
import PaymentModel from "../models/payment";
import UserModel from "../models/user";
import { ApiResponse } from "../types/api";
import PDFDocument from "pdfkit";

export class PaymentController {
  // Create Stripe Checkout Session for a specific level
  static async createCheckoutSession(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { level } = req.body;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: "User not authenticated",
        };
        res.status(401).json(response);
        return;
      }

      // Validate level
      if (!level || ![2, 3, 4].includes(level)) {
        const response: ApiResponse = {
          success: false,
          message: "Invalid level. Only levels 2, 3, and 4 require payment.",
        };
        res.status(400).json(response);
        return;
      }

      // Get user
      const user = await UserModel.findById(userId);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: "User not found",
        };
        res.status(404).json(response);
        return;
      }

      // Check if user already purchased this level (for levels 2 and 3 only)
      // Level 4 can be repurchased to add more attempts
      if (level !== 4) {
        const levelKey = `level${level}` as "level2" | "level3";
        if (user.purchasedLevels[levelKey].purchased) {
          const response: ApiResponse = {
            success: false,
            message: `You have already purchased Level ${level}`,
          };
          res.status(400).json(response);
          return;
        }
      }

      // NOTE: Removed previous level completion check - users can purchase any level anytime

      // Get price for the level
      const priceInCents = getLevelPrice(level);
      if (!priceInCents) {
        const response: ApiResponse = {
          success: false,
          message: "Price not configured for this level",
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
        payment_method_types: ["card"],
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
        mode: "payment",
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
        status: "pending",
      });

      const response: ApiResponse = {
        success: true,
        message: "Checkout session created successfully",
        data: {
          sessionId: session.id,
          url: session.url,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error creating checkout session:", error);
      const response: ApiResponse = {
        success: false,
        message: "Failed to create checkout session",
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
          message: "Session ID is required",
        };
        res.status(400).json(response);
        return;
      }

      // Retrieve session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (!session) {
        const response: ApiResponse = {
          success: false,
          message: "Invalid session",
        };
        res.status(404).json(response);
        return;
      }

      // Get payment record
      const payment = await PaymentModel.findOne({
        stripeSessionId: sessionId,
      });

      if (!payment) {
        const response: ApiResponse = {
          success: false,
          message: "Payment record not found",
        };
        res.status(404).json(response);
        return;
      }

      // Check if payment is already completed
      if (payment.status === "completed") {
        const response: ApiResponse = {
          success: true,
          message: "Payment already verified",
          data: {
            level: payment.level,
            status: payment.status,
          },
        };
        res.status(200).json(response);
        return;
      }

      // Check payment status
      if (session.payment_status === "paid") {
        // Update payment record
        payment.status = "completed";
        payment.stripePaymentIntentId = session.payment_intent as string;
        await payment.save();

        // Update user's purchased levels - unlock bundle based on purchased level
        const user = await UserModel.findById(payment.userId);
        if (user) {
          // Determine which levels to unlock based on purchase
          if (payment.level === 2) {
            // Level 2 purchase - unlock Level 2
            if (!user.purchasedLevels.level2.purchased) {
              user.purchasedLevels.level2.purchased = true;
              user.purchasedLevels.level2.purchaseDate = new Date();
              user.purchasedLevels.level2.paymentId = (payment._id as string).toString();
            }
            user.progress.highestUnlockedLevel = Math.max(user.progress.highestUnlockedLevel, 2);
          } else if (payment.level === 3) {
            // Level 3 bundle - unlock Levels 2 and 3
            if (!user.purchasedLevels.level2.purchased) {
              user.purchasedLevels.level2.purchased = true;
              user.purchasedLevels.level2.purchaseDate = new Date();
              user.purchasedLevels.level2.paymentId = (payment._id as string).toString();
            }
            if (!user.purchasedLevels.level3.purchased) {
              user.purchasedLevels.level3.purchased = true;
              user.purchasedLevels.level3.purchaseDate = new Date();
              user.purchasedLevels.level3.paymentId = (payment._id as string).toString();
            }
            user.progress.highestUnlockedLevel = Math.max(user.progress.highestUnlockedLevel, 3);
          } else if (payment.level === 4) {
            // Level 4 bundle - unlock Levels 2, 3 and add 1 attempt each for L4 and L5
            if (!user.purchasedLevels.level2.purchased) {
              user.purchasedLevels.level2.purchased = true;
              user.purchasedLevels.level2.purchaseDate = new Date();
              user.purchasedLevels.level2.paymentId = (payment._id as string).toString();
            }
            if (!user.purchasedLevels.level3.purchased) {
              user.purchasedLevels.level3.purchased = true;
              user.purchasedLevels.level3.purchaseDate = new Date();
              user.purchasedLevels.level3.paymentId = (payment._id as string).toString();
            }
            // Add 1 attempt credit for Level 4 (pay-per-use)
            user.purchasedLevels.level4.remainingAttempts = (user.purchasedLevels.level4.remainingAttempts || 0) + 1;
            user.purchasedLevels.level4.purchaseDate = new Date();
            user.purchasedLevels.level4.paymentId = (payment._id as string).toString();
            // Add 1 attempt credit for Level 5 (pay-per-use)
            user.purchasedLevels.level5.remainingAttempts = (user.purchasedLevels.level5.remainingAttempts || 0) + 1;
            user.purchasedLevels.level5.purchaseDate = new Date();
            user.purchasedLevels.level5.paymentId = (payment._id as string).toString();

            user.progress.highestUnlockedLevel = Math.max(user.progress.highestUnlockedLevel, 5);
          }

          await user.save();
        }

        const response: ApiResponse = {
          success: true,
          message: `Level ${payment.level} unlocked successfully!`,
          data: {
            level: payment.level,
            status: payment.status,
            purchaseDate: payment.updatedAt,
          },
        };
        res.status(200).json(response);
      } else {
        payment.status = "failed";
        await payment.save();

        const response: ApiResponse = {
          success: false,
          message: "Payment was not successful",
        };
        res.status(400).json(response);
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      const response: ApiResponse = {
        success: false,
        message: "Failed to verify payment",
      };
      res.status(500).json(response);
    }
  }

  // Stripe Webhook Handler
  static async handleWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Webhook secret not configured");
      res.status(500).send("Webhook secret not configured");
      return;
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    try {
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object as Stripe.Checkout.Session;
          await PaymentController.handleCheckoutComplete(session);
          break;

        case "payment_intent.succeeded":
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log("PaymentIntent succeeded:", paymentIntent.id);
          break;

        case "payment_intent.payment_failed":
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          await PaymentController.handlePaymentFailed(failedPayment);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Error handling webhook:", error);
      res.status(500).json({ error: "Webhook handler failed" });
    }
  }

  // Helper: Handle checkout completion
  private static async handleCheckoutComplete(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    const payment = await PaymentModel.findOne({ stripeSessionId: session.id });

    if (!payment) {
      console.error("Payment not found for session:", session.id);
      return;
    }

    if (payment.status === "completed") {
      console.log("Payment already processed:", payment._id);
      return;
    }

    // Update payment
    payment.status = "completed";
    payment.stripePaymentIntentId = session.payment_intent as string;
    await payment.save();

    // Update user - unlock bundle based on purchased level
    const user = await UserModel.findById(payment.userId);
    if (user) {
      // Determine which levels to unlock based on purchase
      if (payment.level === 2) {
        // Level 2 purchase - unlock Level 2
        if (!user.purchasedLevels.level2.purchased) {
          user.purchasedLevels.level2.purchased = true;
          user.purchasedLevels.level2.purchaseDate = new Date();
          user.purchasedLevels.level2.paymentId = (payment._id as string).toString();
        }
        user.progress.highestUnlockedLevel = Math.max(user.progress.highestUnlockedLevel, 2);
      } else if (payment.level === 3) {
        // Level 3 bundle - unlock Levels 2 and 3
        if (!user.purchasedLevels.level2.purchased) {
          user.purchasedLevels.level2.purchased = true;
          user.purchasedLevels.level2.purchaseDate = new Date();
          user.purchasedLevels.level2.paymentId = (payment._id as string).toString();
        }
        if (!user.purchasedLevels.level3.purchased) {
          user.purchasedLevels.level3.purchased = true;
          user.purchasedLevels.level3.purchaseDate = new Date();
          user.purchasedLevels.level3.paymentId = (payment._id as string).toString();
        }
        user.progress.highestUnlockedLevel = Math.max(user.progress.highestUnlockedLevel, 3);
      } else if (payment.level === 4) {
        // Level 4 bundle - unlock Levels 2, 3 and add 1 attempt each for L4 and L5
        if (!user.purchasedLevels.level2.purchased) {
          user.purchasedLevels.level2.purchased = true;
          user.purchasedLevels.level2.purchaseDate = new Date();
          user.purchasedLevels.level2.paymentId = (payment._id as string).toString();
        }
        if (!user.purchasedLevels.level3.purchased) {
          user.purchasedLevels.level3.purchased = true;
          user.purchasedLevels.level3.purchaseDate = new Date();
          user.purchasedLevels.level3.paymentId = (payment._id as string).toString();
        }
        // Add 1 attempt credit for Level 4 (pay-per-use)
        user.purchasedLevels.level4.remainingAttempts = (user.purchasedLevels.level4.remainingAttempts || 0) + 1;
        user.purchasedLevels.level4.purchaseDate = new Date();
        user.purchasedLevels.level4.paymentId = (payment._id as string).toString();
        // Add 1 attempt credit for Level 5 (pay-per-use)
        user.purchasedLevels.level5.remainingAttempts = (user.purchasedLevels.level5.remainingAttempts || 0) + 1;
        user.purchasedLevels.level5.purchaseDate = new Date();
        user.purchasedLevels.level5.paymentId = (payment._id as string).toString();

        user.progress.highestUnlockedLevel = Math.max(user.progress.highestUnlockedLevel, 5);
      }

      await user.save();
      console.log(`Payment level ${payment.level} processed for user ${user._id}`);
    }
  }

  // Helper: Handle payment failure
  private static async handlePaymentFailed(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    const payment = await PaymentModel.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (payment) {
      payment.status = "failed";
      await payment.save();
      console.log("Payment failed:", payment._id);
    }
  }

  // Get user's payment history
  static async getPaymentHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: "User not authenticated",
        };
        res.status(401).json(response);
        return;
      }

      const payments = await PaymentModel.find({ userId }).sort({
        createdAt: -1,
      });

      // Enrich payments with Stripe receipt URLs for completed payments
      const enrichedPayments = await Promise.all(
        payments.map(async (payment) => {
          const paymentObj = payment.toObject();

          // Only fetch receipt URL for completed payments with payment intent
          if (payment.status === "completed" && payment.stripePaymentIntentId) {
            try {
              const paymentIntent = await stripe.paymentIntents.retrieve(
                payment.stripePaymentIntentId
              );

              // Get the charge to access receipt URL
              if (paymentIntent.latest_charge) {
                const charge = await stripe.charges.retrieve(
                  paymentIntent.latest_charge as string
                );
                (paymentObj as any).receiptUrl = charge.receipt_url;
              }
            } catch (error) {
              console.error("Error fetching receipt URL:", error);
              // Continue without receipt URL
            }
          }

          return paymentObj;
        })
      );

      const response: ApiResponse = {
        success: true,
        message: "Payment history retrieved successfully",
        data: enrichedPayments,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      const response: ApiResponse = {
        success: false,
        message: "Failed to fetch payment history",
      };
      res.status(500).json(response);
    }
  }

  // Download Invoice PDF
  static async downloadInvoice(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { sessionId } = req.params;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: "User not authenticated",
        };
        res.status(401).json(response);
        return;
      }

      // Find payment by session ID and verify ownership
      const payment = await PaymentModel.findOne({
        stripeSessionId: sessionId,
        userId,
      });

      if (!payment) {
        const response: ApiResponse = {
          success: false,
          message: "Payment not found",
        };
        res.status(404).json(response);
        return;
      }

      // Get user details
      const user = await UserModel.findById(userId);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: "User not found",
        };
        res.status(404).json(response);
        return;
      }

      // Generate invoice data
      const invoiceDate = new Date(payment.createdAt).toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        }
      );

      const invoiceNumber = `INV-${payment.createdAt.getFullYear()}-${String(
        payment.createdAt.getMonth() + 1
      ).padStart(2, "0")}-${sessionId.slice(-8).toUpperCase()}`;

      let productName = `LifeScore Level ${payment.level} Access`;
      let productDescription = `One-time purchase to unlock Level ${payment.level} assessment`;

      if (payment.level === 3) {
        productName = `LifeScore Levels 2 & 3 Bundle`;
        productDescription = `Unlock both Level 2 and Level 3 assessments`;
      } else if (payment.level === 4) {
        productName = `LifeScore Complete Bundle (Levels 2, 3 & 4)`;
        productDescription = `Unlock all premium assessments: Levels 2, 3, and 4`;
      }

      const amount = (payment.amount / 100).toFixed(2);

      // Create PDF document
      const doc = new PDFDocument({ margin: 50, size: "A4" });

      // Set response headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="invoice-${invoiceNumber}.pdf"`
      );

      // Pipe PDF to response
      doc.pipe(res);

      // Add content to PDF
      let yPosition = 50;

      // Header with company name
      doc.fontSize(28).fillColor("#005F73").text("INVOICE", 50, yPosition);

      yPosition += 35;
      doc
        .fontSize(12)
        .fillColor("#666666")
        .text("LifeScore Assessment Platform", 50, yPosition);

      // Horizontal line
      yPosition += 25;
      doc
        .moveTo(50, yPosition)
        .lineTo(545, yPosition)
        .strokeColor("#005F73")
        .lineWidth(2)
        .stroke();

      // Invoice details section
      yPosition += 30;

      // Left side - Billed To
      doc.fontSize(10).fillColor("#005F73").text("BILLED TO", 50, yPosition);

      const leftColumnY = yPosition + 20;
      doc
        .fontSize(11)
        .fillColor("#000000")
        .text(user.username, 50, leftColumnY);

      doc
        .fontSize(10)
        .fillColor("#666666")
        .text(user.email, 50, leftColumnY + 17);

      if (user.phoneNumber) {
        doc.fontSize(10).text(user.phoneNumber, 50, leftColumnY + 34);
      }

      // Right side - Invoice Details
      doc
        .fontSize(10)
        .fillColor("#005F73")
        .text("INVOICE DETAILS", 320, yPosition);

      const rightColumnY = yPosition + 20;

      // Invoice number row
      doc
        .fontSize(10)
        .fillColor("#666666")
        .text("Invoice #:", 320, rightColumnY);

      doc
        .fontSize(10)
        .fillColor("#000000")
        .text(invoiceNumber, 420, rightColumnY, { width: 125, align: "left" });

      // Date row
      doc
        .fontSize(10)
        .fillColor("#666666")
        .text("Date:", 320, rightColumnY + 17);

      doc
        .fontSize(10)
        .fillColor("#000000")
        .text(invoiceDate, 420, rightColumnY + 17, {
          width: 125,
          align: "left",
        });

      // Status row
      doc
        .fontSize(10)
        .fillColor("#666666")
        .text("Status:", 320, rightColumnY + 34);

      doc
        .fontSize(10)
        .fillColor("#2E7D32")
        .text(payment.status.toUpperCase(), 420, rightColumnY + 34, {
          width: 125,
          align: "left",
        });

      // Transaction details box
      yPosition += 110;
      doc.rect(50, yPosition, 495, 95).fillAndStroke("#f9f9f9", "#e0e0e0");

      const boxPadding = 20;
      const boxContentY = yPosition + boxPadding;

      // Transaction ID row
      doc
        .fontSize(9)
        .fillColor("#666666")
        .text("Transaction ID:", 70, boxContentY);

      doc
        .fontSize(9)
        .fillColor("#000000")
        .text(sessionId.slice(-12).toUpperCase(), 320, boxContentY, {
          width: 205,
          align: "right",
        });

      // Payment Method row
      doc
        .fontSize(9)
        .fillColor("#666666")
        .text("Payment Method:", 70, boxContentY + 25);

      doc
        .fontSize(9)
        .fillColor("#000000")
        .text("Credit Card", 320, boxContentY + 25, {
          width: 205,
          align: "right",
        });

      // Currency row
      doc
        .fontSize(9)
        .fillColor("#666666")
        .text("Currency:", 70, boxContentY + 50);

      doc
        .fontSize(9)
        .fillColor("#000000")
        .text(payment.currency.toUpperCase(), 320, boxContentY + 50, {
          width: 205,
          align: "right",
        });

      // Table section
      yPosition += 135;

      // Table header
      doc.rect(50, yPosition, 495, 35).fillAndStroke("#005F73", "#005F73");

      doc
        .fontSize(11)
        .fillColor("#FFFFFF")
        .text("Description", 70, yPosition + 12);

      doc
        .fontSize(11)
        .fillColor("#FFFFFF")
        .text("Amount", 420, yPosition + 12, { width: 105, align: "right" });

      // Table content
      yPosition += 35;
      const tableRowY = yPosition + 20;

      doc
        .fontSize(11)
        .fillColor("#000000")
        .text(productName, 70, tableRowY, { width: 330 });

      doc
        .fontSize(9)
        .fillColor("#666666")
        .text(productDescription, 70, tableRowY + 18, { width: 330 });

      doc
        .fontSize(11)
        .fillColor("#000000")
        .text(`$${amount}`, 420, tableRowY, { width: 105, align: "right" });

      // Line separator
      yPosition += 75;
      doc
        .moveTo(50, yPosition)
        .lineTo(545, yPosition)
        .strokeColor("#e0e0e0")
        .lineWidth(1)
        .stroke();

      // Total row
      yPosition += 5;
      doc.rect(50, yPosition, 495, 45).fillAndStroke("#f9f9f9", "#e0e0e0");

      doc
        .fontSize(14)
        .fillColor("#000000")
        .text("TOTAL", 70, yPosition + 15);

      doc
        .fontSize(14)
        .fillColor("#000000")
        .text(`$${amount}`, 420, yPosition + 15, {
          width: 105,
          align: "right",
        });

      // Footer
      yPosition += 75;
      doc
        .moveTo(50, yPosition)
        .lineTo(545, yPosition)
        .strokeColor("#e0e0e0")
        .lineWidth(1)
        .stroke();

      yPosition += 20;
      doc
        .fontSize(10)
        .fillColor("#666666")
        .text("Thank you for your purchase!", 50, yPosition, {
          align: "center",
          width: 495,
        });

      yPosition += 20;
      doc
        .fontSize(9)
        .fillColor("#666666")
        .text(
          "For questions about this invoice, please contact support@lifescore.com",
          50,
          yPosition,
          { align: "center", width: 495 }
        );

      yPosition += 30;
      doc
        .fontSize(8)
        .fillColor("#999999")
        .text(
          `LifeScore © ${new Date().getFullYear()}. All rights reserved.`,
          50,
          yPosition,
          { align: "center", width: 495 }
        );

      // Finalize PDF
      doc.end();
    } catch (error) {
      console.error("Error generating invoice:", error);

      // Check if headers are already sent
      if (!res.headersSent) {
        const response: ApiResponse = {
          success: false,
          message: "Failed to generate invoice",
        };
        res.status(500).json(response);
      }
    }
  }
}
