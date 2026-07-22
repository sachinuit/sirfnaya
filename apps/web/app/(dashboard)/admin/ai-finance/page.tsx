"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, DollarSign, AlertCircle, Lightbulb } from "lucide-react";
import { useFinanceInsights, useRevenueForecast, useExpenseAnalysis } from "@/lib/hooks/use-ai-finance";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AIFinancePage() {
    const { data: insights, isLoading: insightsLoading } = useFinanceInsights();
    const { data: forecast, isLoading: forecastLoading } = useRevenueForecast(30);
    const { data: expenses, isLoading: expensesLoading } = useExpenseAnalysis();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)] flex items-center gap-3">
                        <Brain className="h-8 w-8 text-primary" />
                        AI Finance System
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Intelligent financial insights, forecasting, and recommendations powered by AI
                    </p>
                </div>
                <Button onClick={() => toast.info("Refreshing AI predictions...")}>
                    Refresh Predictions
                </Button>
            </div>

            {/* Key Financial Insights */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {insightsLoading ? (
                    [...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-[60px]" />
                            </CardContent>
                        </Card>
                    ))
                ) : insights && insights.length > 0 ? (
                    insights.slice(0, 4).map((insight, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{insight.metric}</CardTitle>
                                {insight.trend === "up" ? (
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : insight.trend === "down" ? (
                                    <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                                ) : (
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${insight.currentValue.toLocaleString()}</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant={insight.trend === "up" ? "default" : insight.trend === "down" ? "destructive" : "secondary"}>
                                        {insight.trend === "up" ? "↑" : insight.trend === "down" ? "↓" : "→"} {Math.abs(insight.predictedValue - insight.currentValue).toFixed(0)}%
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {insight.confidence >= 0.8 ? "High" : insight.confidence >= 0.6 ? "Medium" : "Low"} confidence
                                    </span>
                                </div>
                                {insight.recommendation && (
                                    <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                                        <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
                                        {insight.recommendation}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="col-span-full">
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No AI insights available yet
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Revenue Forecast Chart */}
            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            AI Revenue Forecast (Next 30 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            {forecastLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <Skeleton className="w-full h-full" />
                                </div>
                            ) : forecast && forecast.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={forecast}>
                                        <defs>
                                            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(str) => format(new Date(str), "MMM d")}
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `$${value}`}
                                        />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                            formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Predicted Revenue"]}
                                            labelFormatter={(label) => format(new Date(label), "MMMM d, yyyy")}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="predicted"
                                            stroke="#8884d8"
                                            fillOpacity={1}
                                            fill="url(#colorPredicted)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    No forecast data available
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Expense Analysis */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            AI Expense Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {expensesLoading ? (
                            <div className="space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : expenses ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <span className="text-sm font-medium">Total Expenses</span>
                                    <span className="text-lg font-bold">${expenses.totalExpenses.toLocaleString()}</span>
                                </div>
                                
                                {expenses.anomalies && expenses.anomalies.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2">Detected Anomalies</h4>
                                        <div className="space-y-2">
                                            {expenses.anomalies.map((anomaly, index) => (
                                                <div key={index} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-900">
                                                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                                    <p className="text-xs text-red-700 dark:text-red-300">{anomaly.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {expenses.savingsOpportunities && expenses.savingsOpportunities.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                                            Savings Opportunities
                                        </h4>
                                        <ul className="space-y-1">
                                            {expenses.savingsOpportunities.map((opp, index) => (
                                                <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                                                    <span className="text-green-500">•</span>
                                                    {opp}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                No expense analysis available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
