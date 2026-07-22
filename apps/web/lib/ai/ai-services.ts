/**
 * AI-powered utilities for Sirfnaya e-commerce platform
 * Provides intelligent features for search, finance, GST, reporting, inventory, and support
 */

import { toast } from "sonner";

// Mock AI service endpoints (replace with actual API calls)
const AI_API_BASE = process.env.NEXT_PUBLIC_AI_API_URL || "/api/ai";

/**
 * AI Search Enhancement
 * Provides semantic search, autocomplete, and product recommendations
 */
export interface AISearchResult {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  relevanceScore: number;
  aiSummary?: string;
}

export async function performAISearch(query: string): Promise<AISearchResult[]> {
  try {
    const response = await fetch(`${AI_API_BASE}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) throw new Error("AI search failed");
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("AI Search error:", error);
    // Fallback to basic search
    return [];
  }
}

export async function getSearchSuggestions(query: string): Promise<string[]> {
  try {
    const response = await fetch(`${AI_API_BASE}/search/suggestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) throw new Error("Failed to get suggestions");
    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error("Search suggestions error:", error);
    return [];
  }
}

/**
 * AI Finance System
 * Provides revenue forecasting, expense analysis, and financial insights
 */
export interface FinanceInsight {
  metric: string;
  currentValue: number;
  predictedValue: number;
  trend: "up" | "down" | "stable";
  confidence: number;
  recommendation: string;
}

export interface RevenueForecast {
  date: string;
  predicted: number;
  lowerBound: number;
  upperBound: number;
}

export async function getFinanceInsights(): Promise<FinanceInsight[]> {
  try {
    const response = await fetch(`${AI_API_BASE}/finance/insights`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) throw new Error("Failed to fetch finance insights");
    const data = await response.json();
    return data.insights || [];
  } catch (error) {
    console.error("Finance insights error:", error);
    return [];
  }
}

export async function getRevenueForecast(days: number = 30): Promise<RevenueForecast[]> {
  try {
    const response = await fetch(`${AI_API_BASE}/finance/forecast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days }),
    });
    
    if (!response.ok) throw new Error("Failed to fetch revenue forecast");
    const data = await response.json();
    return data.forecast || [];
  } catch (error) {
    console.error("Revenue forecast error:", error);
    return [];
  }
}

export async function analyzeExpenses(): Promise<{
  totalExpenses: number;
  categories: { name: string; amount: number; percentage: number }[];
  anomalies: { description: string; severity: "low" | "medium" | "high" }[];
  savingsOpportunities: string[];
}> {
  try {
    const response = await fetch(`${AI_API_BASE}/finance/expenses/analyze`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) throw new Error("Failed to analyze expenses");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Expense analysis error:", error);
    return {
      totalExpenses: 0,
      categories: [],
      anomalies: [],
      savingsOpportunities: [],
    };
  }
}

/**
 * AI GST Dashboard
 * Provides GST compliance, tax calculations, and filing assistance
 */
export interface GSTSummary {
  totalSales: number;
  totalGSTCollected: number;
  totalPurchases: number;
  totalGSTPaid: number;
  netGSTPayable: number;
  filingStatus: "filed" | "pending" | "overdue";
  dueDate: string;
}

export interface GSTTransaction {
  id: string;
  date: string;
  type: "sale" | "purchase";
  amount: number;
  gstRate: number;
  gstAmount: number;
  invoiceNumber: string;
}

export async function getGSTSummary(period: string = "current-month"): Promise<GSTSummary> {
  try {
    const response = await fetch(`${AI_API_BASE}/gst/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period }),
    });
    
    if (!response.ok) throw new Error("Failed to fetch GST summary");
    const data = await response.json();
    return data.summary || {};
  } catch (error) {
    console.error("GST summary error:", error);
    return {
      totalSales: 0,
      totalGSTCollected: 0,
      totalPurchases: 0,
      totalGSTPaid: 0,
      netGSTPayable: 0,
      filingStatus: "pending",
      dueDate: "",
    };
  }
}

export async function getGSTTransactions(period: string = "current-month"): Promise<GSTTransaction[]> {
  try {
    const response = await fetch(`${AI_API_BASE}/gst/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ period }),
    });
    
    if (!response.ok) throw new Error("Failed to fetch GST transactions");
    const data = await response.json();
    return data.transactions || [];
  } catch (error) {
    console.error("GST transactions error:", error);
    return [];
  }
}

export async function generateGSTRReport(reportType: "GSTR1" | "GSTR2" | "GSTR3B"): Promise<{
  reportUrl: string;
  summary: string;
  warnings: string[];
}> {
  try {
    const response = await fetch(`${AI_API_BASE}/gst/generate-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportType }),
    });
    
    if (!response.ok) throw new Error("Failed to generate GST report");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("GST report generation error:", error);
    throw new Error("Failed to generate GST report");
  }
}

/**
 * AI Reporting System
 * Provides automated reports, insights, and data visualization
 */
export interface ReportData {
  id: string;
  title: string;
  type: "sales" | "inventory" | "customer" | "financial" | "custom";
  generatedAt: string;
  data: Record<string, any>;
  insights: string[];
  charts: { type: string; data: any[]; title: string }[];
}

export async function generateReport(
  type: string,
  dateRange: { start: string; end: string },
  filters?: Record<string, any>
): Promise<ReportData> {
  try {
    const response = await fetch(`${AI_API_BASE}/reports/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, dateRange, filters }),
    });
    
    if (!response.ok) throw new Error("Failed to generate report");
    const data = await response.json();
    return data.report || {};
  } catch (error) {
    console.error("Report generation error:", error);
    throw new Error("Failed to generate report");
  }
}

export async function getReportInsights(reportId: string): Promise<string[]> {
  try {
    const response = await fetch(`${AI_API_BASE}/reports/${reportId}/insights`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) throw new Error("Failed to fetch insights");
    const data = await response.json();
    return data.insights || [];
  } catch (error) {
    console.error("Report insights error:", error);
    return [];
  }
}

export async function scheduleAutomatedReport(
  type: string,
  frequency: "daily" | "weekly" | "monthly",
  recipients: string[]
): Promise<{ success: boolean; scheduleId: string }> {
  try {
    const response = await fetch(`${AI_API_BASE}/reports/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, frequency, recipients }),
    });
    
    if (!response.ok) throw new Error("Failed to schedule report");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Schedule report error:", error);
    throw new Error("Failed to schedule report");
  }
}

/**
 * AI Ticketing & Support System
 * Provides intelligent ticket routing, auto-responses, and sentiment analysis
 */
export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  customerEmail: string;
  sentiment: "positive" | "neutral" | "negative";
  aiSuggestedResponse?: string;
}

export async function createTicket(
  subject: string,
  description: string,
  customerEmail: string,
  category: string
): Promise<SupportTicket> {
  try {
    const response = await fetch(`${AI_API_BASE}/support/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, description, customerEmail, category }),
    });
    
    if (!response.ok) throw new Error("Failed to create ticket");
    const data = await response.json();
    return data.ticket || {};
  } catch (error) {
    console.error("Create ticket error:", error);
    throw new Error("Failed to create ticket");
  }
}

export async function getTickets(filters?: {
  status?: string;
  priority?: string;
  assignee?: string;
}): Promise<SupportTicket[]> {
  try {
    const params = new URLSearchParams(filters as any);
    const response = await fetch(`${AI_API_BASE}/support/tickets?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) throw new Error("Failed to fetch tickets");
    const data = await response.json();
    return data.tickets || [];
  } catch (error) {
    console.error("Get tickets error:", error);
    return [];
  }
}

export async function getAISuggestedResponse(ticketId: string): Promise<string> {
  try {
    const response = await fetch(`${AI_API_BASE}/support/tickets/${ticketId}/suggested-response`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) throw new Error("Failed to get suggested response");
    const data = await response.json();
    return data.response || "";
  } catch (error) {
    console.error("Suggested response error:", error);
    return "";
  }
}

export async function analyzeTicketSentiment(ticketId: string): Promise<"positive" | "neutral" | "negative"> {
  try {
    const response = await fetch(`${AI_API_BASE}/support/tickets/${ticketId}/sentiment`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) throw new Error("Failed to analyze sentiment");
    const data = await response.json();
    return data.sentiment || "neutral";
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return "neutral";
  }
}

export async function autoRouteTicket(ticketId: string): Promise<{
  assignedTo: string;
  reason: string;
  confidence: number;
}> {
  try {
    const response = await fetch(`${AI_API_BASE}/support/tickets/${ticketId}/auto-route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) throw new Error("Failed to auto-route ticket");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Auto-route error:", error);
    throw new Error("Failed to auto-route ticket");
  }
}

/**
 * AI Inventory Management
 * Provides demand forecasting, stock optimization, and reorder suggestions
 */
export interface InventoryPrediction {
  productId: string;
  productName: string;
  currentStock: number;
  predictedDemand: number;
  daysUntilStockout: number;
  recommendedReorderQuantity: number;
  optimalStockLevel: number;
  confidence: number;
}

export async function getInventoryPredictions(): Promise<InventoryPrediction[]> {
  try {
    const response = await fetch(`${AI_API_BASE}/inventory/predictions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) throw new Error("Failed to fetch inventory predictions");
    const data = await response.json();
    return data.predictions || [];
  } catch (error) {
    console.error("Inventory predictions error:", error);
    return [];
  }
}

export async function getDemandForecast(productId: string, days: number = 30): Promise<{
  date: string;
  predictedDemand: number;
  confidenceInterval: { lower: number; upper: number };
}[]> {
  try {
    const response = await fetch(`${AI_API_BASE}/inventory/demand-forecast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, days }),
    });
    
    if (!response.ok) throw new Error("Failed to fetch demand forecast");
    const data = await response.json();
    return data.forecast || [];
  } catch (error) {
    console.error("Demand forecast error:", error);
    return [];
  }
}

export async function getReorderSuggestions(): Promise<{
  productId: string;
  productName: string;
  currentStock: number;
  suggestedQuantity: number;
  urgency: "low" | "medium" | "high" | "critical";
  estimatedCost: number;
}[]> {
  try {
    const response = await fetch(`${AI_API_BASE}/inventory/reorder-suggestions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) throw new Error("Failed to fetch reorder suggestions");
    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error("Reorder suggestions error:", error);
    return [];
  }
}

/**
 * AI Product Management
 * Provides product insights, pricing optimization, and description generation
 */
export interface ProductInsight {
  productId: string;
  productName: string;
  views: number;
  conversionRate: number;
  revenueContribution: number;
  performanceScore: number;
  recommendations: string[];
}

export async function getProductInsights(): Promise<ProductInsight[]> {
  try {
    const response = await fetch(`${AI_API_BASE}/products/insights`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) throw new Error("Failed to fetch product insights");
    const data = await response.json();
    return data.insights || [];
  } catch (error) {
    console.error("Product insights error:", error);
    return [];
  }
}

export async function optimizePrice(productId: string): Promise<{
  currentPrice: number;
  recommendedPrice: number;
  expectedRevenueIncrease: number;
  confidence: number;
  reasoning: string;
}> {
  try {
    const response = await fetch(`${AI_API_BASE}/products/${productId}/optimize-price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) throw new Error("Failed to optimize price");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Price optimization error:", error);
    throw new Error("Failed to optimize price");
  }
}

export async function generateProductDescription(
  productName: string,
  features: string[],
  category: string
): Promise<string> {
  try {
    const response = await fetch(`${AI_API_BASE}/products/generate-description`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productName, features, category }),
    });
    
    if (!response.ok) throw new Error("Failed to generate description");
    const data = await response.json();
    return data.description || "";
  } catch (error) {
    console.error("Generate description error:", error);
    return "";
  }
}

export async function analyzeProductPerformance(productId: string): Promise<{
  salesTrend: "increasing" | "decreasing" | "stable";
  seasonalityDetected: boolean;
  competitorComparison: string;
  improvementSuggestions: string[];
}> {
  try {
    const response = await fetch(`${AI_API_BASE}/products/${productId}/performance`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) throw new Error("Failed to analyze performance");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Product performance error:", error);
    throw new Error("Failed to analyze performance");
  }
}
