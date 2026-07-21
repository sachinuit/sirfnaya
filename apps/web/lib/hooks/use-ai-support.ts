"use client";

import { useEffect, useState } from "react";
import { createTicket, getTickets, getAISuggestedResponse, SupportTicket } from "@/lib/ai/ai-services";

export function useSupportTickets() {
    const [data, setData] = useState<SupportTicket[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Mock data for demonstration
    useEffect(() => {
        const mockTickets: SupportTicket[] = [
            {
                id: "1",
                subject: "Product not received",
                description: "I ordered a laptop 5 days ago but haven't received any shipping confirmation yet.",
                status: "open",
                priority: "high",
                category: "shipping",
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                customerEmail: "john.doe@example.com",
                sentiment: "negative",
                aiSuggestedResponse: "Dear Customer, We apologize for the delay. Let me check your order status immediately. Your order #12345 is currently being processed and will ship within 24 hours."
            },
            {
                id: "2",
                subject: "Question about warranty",
                description: "Does the iPhone 15 Pro Max come with international warranty coverage?",
                status: "in-progress",
                priority: "medium",
                category: "general",
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                customerEmail: "sarah.smith@example.com",
                sentiment: "neutral",
                aiSuggestedResponse: "Hello! Yes, all Apple products purchased from Sirfnaya come with international warranty coverage valid in over 190 countries. The warranty is valid for 1 year from the date of purchase."
            },
            {
                id: "3",
                subject: "Excellent service!",
                description: "Just wanted to say thank you for the quick delivery and excellent product quality!",
                status: "resolved",
                priority: "low",
                category: "general",
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                customerEmail: "mike.johnson@example.com",
                sentiment: "positive",
                aiSuggestedResponse: "Thank you so much for your kind words! We're thrilled to hear about your positive experience. Your feedback means the world to us!"
            },
            {
                id: "4",
                subject: "Refund request",
                description: "The tablet I received has a defective screen. I would like to request a refund or replacement.",
                status: "open",
                priority: "urgent",
                category: "returns",
                createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                customerEmail: "emma.wilson@example.com",
                sentiment: "negative",
                aiSuggestedResponse: "We sincerely apologize for the inconvenience. We'll process your replacement immediately. A prepaid return label has been sent to your email. Your new device will ship today via express delivery."
            },
            {
                id: "5",
                subject: "Bulk order discount",
                description: "We're interested in purchasing 50 laptops for our company. Do you offer bulk discounts?",
                status: "open",
                priority: "medium",
                category: "billing",
                createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                customerEmail: "procurement@techcorp.com",
                sentiment: "neutral",
                aiSuggestedResponse: "Absolutely! We offer special pricing for bulk orders. For 50+ units, you're eligible for up to 15% discount. Our B2B team will contact you within 2 hours with a custom quote."
            }
        ];
        setData(mockTickets);
        setIsLoading(false);
    }, []);

    const createTicketFn = async (subject: string, description: string, customerEmail: string, category: string) => {
        try {
            setIsLoading(true);
            const ticket = await createTicket(subject, description, customerEmail, category);
            setData(prev => prev ? [ticket, ...prev] : [ticket]);
            return ticket;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getSuggestedResponseFn = async (ticketId: string) => {
        try {
            const response = await getAISuggestedResponse(ticketId);
            return response;
        } catch (err) {
            console.error("Failed to get suggested response:", err);
            return "";
        }
    };

    return { 
        data, 
        isLoading, 
        error, 
        createTicket: createTicketFn,
        getSuggestedResponse: getSuggestedResponseFn
    };
}
