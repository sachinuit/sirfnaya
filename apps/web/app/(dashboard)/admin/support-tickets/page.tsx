"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, MessageSquare, Send, Clock, CheckCircle, AlertCircle, Sparkles, User, Headphones } from "lucide-react";
import { useSupportTickets } from "@/lib/hooks/use-ai-support";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function SupportTicketsPage() {
    const { data: tickets, isLoading, createTicket, getSuggestedResponse } = useSupportTickets();
    const [newTicketOpen, setNewTicketOpen] = useState(false);
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("general");

    const handleSubmitTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            toast.info("Creating ticket...");
            await createTicket(subject, description, "customer@example.com", category);
            toast.success("Ticket created successfully!");
            setSubject("");
            setDescription("");
            setCategory("general");
            setNewTicketOpen(false);
        } catch (error) {
            toast.error("Failed to create ticket");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)] flex items-center gap-3">
                        <Brain className="h-8 w-8 text-primary" />
                        AI Support & Ticketing System
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Intelligent ticket routing, auto-responses, and sentiment analysis
                    </p>
                </div>
                <Button onClick={() => setNewTicketOpen(!newTicketOpen)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    New Ticket
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tickets?.filter(t => t.status === "open").length || 0}</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                        <Clock className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2.4 hrs</div>
                        <p className="text-xs text-muted-foreground">AI-assisted</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">85% first-contact resolution</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">94%</div>
                        <p className="text-xs text-muted-foreground">Based on recent surveys</p>
                    </CardContent>
                </Card>
            </div>

            {/* New Ticket Form */}
            {newTicketOpen && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create Support Ticket</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmitTicket} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Subject</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        placeholder="Brief description of your issue"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="general">General Inquiry</option>
                                        <option value="technical">Technical Support</option>
                                        <option value="billing">Billing Issue</option>
                                        <option value="shipping">Shipping & Delivery</option>
                                        <option value="returns">Returns & Refunds</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-[100px]"
                                    placeholder="Provide detailed information about your issue..."
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit Ticket
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setNewTicketOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Tickets List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Support Tickets
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-20 w-full" />
                            ))}
                        </div>
                    ) : tickets && tickets.length > 0 ? (
                        <div className="space-y-3">
                            {tickets.map((ticket) => (
                                <div key={ticket.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                {ticket.sentiment === "negative" ? (
                                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                                ) : ticket.sentiment === "positive" ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <User className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold">{ticket.subject}</p>
                                                    <Badge variant={
                                                        ticket.priority === "urgent" ? "destructive" :
                                                        ticket.priority === "high" ? "default" :
                                                        ticket.priority === "medium" ? "secondary" : "outline"
                                                    }>
                                                        {ticket.priority}
                                                    </Badge>
                                                    <Badge variant={
                                                        ticket.status === "resolved" ? "default" :
                                                        ticket.status === "in-progress" ? "secondary" : "outline"
                                                    }>
                                                        {ticket.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    #{ticket.id} • {ticket.customerEmail} • {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => {
                                                toast.info("Generating AI response...");
                                                // In real implementation, call getSuggestedResponse
                                            }}>
                                                <Sparkles className="h-4 w-4 mr-1" />
                                                AI Suggest
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Headphones className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">{ticket.description}</p>
                                    {ticket.aiSuggestedResponse && (
                                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-900">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Brain className="h-4 w-4 text-blue-500" />
                                                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">AI Suggested Response</span>
                                            </div>
                                            <p className="text-sm text-blue-700 dark:text-blue-300">{ticket.aiSuggestedResponse}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            No tickets found
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
