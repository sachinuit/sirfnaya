import { env } from "../../config/env.js";
import { resend } from "../../config/resend.js";

export const emailService = {
    async sendVerificationEmail(email: string, name: string, otp: string) {
        try {
            await resend.emails.send({
                from: `SirfNaya <${env.SMTP_FROM}>`,
                to: email,
                subject: "Verify your email address",
                html: `
                    <h1>Welcome to SirfNaya, ${name}!</h1>
                    <p>Your verification code is: <strong>${otp}</strong></p>
                    <p>This code will expire in 15 minutes.</p>
                `,
            });
        } catch (error) {
            console.error("Failed to send verification email:", error);
        }
    },

    async sendWelcomeEmail(email: string, name: string) {
        try {
            await resend.emails.send({
                from: `SirfNaya <${env.SMTP_FROM}>`,
                to: email,
                subject: "Welcome to SirfNaya!",
                html: `<h1>Welcome, ${name}!</h1><p>Thank you for joining SirfNaya.</p>`,
            });
        } catch (error) {
            console.error("Failed to send welcome email:", error);
        }
    },

    async sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
        try {
            await resend.emails.send({
                from: `SirfNaya <${env.SMTP_FROM}>`,
                to: email,
                subject: "Reset your password",
                html: `
                    <h1>Hi ${name},</h1>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetUrl}">${resetUrl}</a>
                    <p>This link will expire in 1 hour.</p>
                `,
            });
        } catch (error) {
            console.error("Failed to send password reset email:", error);
        }
    },

    async sendOrderConfirmationEmail(email: string, orderId: string, total: number) {
        try {
            await resend.emails.send({
                from: `SirfNaya <${env.SMTP_FROM}>`,
                to: email,
                subject: `Order Confirmed - #${orderId.slice(0, 8)}`,
                html: `
                    <h1>Order Confirmed!</h1>
                    <p>Your order <strong>#${orderId.slice(0, 8)}</strong> has been confirmed.</p>
                    <p>Total: ₹${total.toFixed(2)}</p>
                `,
            });
        } catch (error) {
            console.error("Failed to send order confirmation email:", error);
        }
    },
};
