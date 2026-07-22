"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, Calculator, AlertTriangle, CheckCircle, Download } from "lucide-react";
import { useGSTSummary, useGSTTransactions } from "@/lib/hooks/use-ai-gst";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AIGSTPage() {
    const { data: summary, isLoading: summaryLoading } = useGSTSummary("current-month");
    const { data: transactions, isLoading: transactionsLoading } = useGSTTransactions("current-month");

    const handleGenerateReport = async (reportType: "GSTR1" | "GSTR2" | "GSTR3B") => {
        try {
            toast.info(`Generating ${reportType} report...`);
            // In real implementation, call the API
            setTimeout(() => {
                toast.success(`${reportType} report generated successfully!`);
            }, 2000);
        } catch (error) {
            toast.error(`Failed to generate ${reportType} report`);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)] flex items-center gap-3">
                        <Brain className="h-8 w-8 text-primary" />
                        AI GST Dashboard
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Intelligent GST compliance, tax calculations, and filing assistance
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleGenerateReport("GSTR1")}>
                        <Download className="h-4 w-4 mr-2" />
                        GSTR-1
                    </Button>
                    <Button variant="outline" onClick={() => handleGenerateReport("GSTR2")}>
                        <Download className="h-4 w-4 mr-2" />
                        GSTR-2
                    </Button>
                    <Button variant="outline" onClick={() => handleGenerateReport("GSTR3B")}>
                        <Download className="h-4 w-4 mr-2" />
                        GSTR-3B
                    </Button>
                </div>
            </div>

            {/* GST Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {summaryLoading ? (
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
                ) : summary ? (
                    <>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Sales (GST)</CardTitle>
                                <Calculator className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${summary.totalSales.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    GST Collected: ${summary.totalGSTCollected.toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Purchases (GST)</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${summary.totalPurchases.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    GST Paid: ${summary.totalGSTPaid.toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Net GST Payable</CardTitle>
                                <Brain className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${summary.netGSTPayable >= 0 ? "text-red-500" : "text-green-500"}`}>
                                    ${Math.abs(summary.netGSTPayable).toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {summary.netGSTPayable >= 0 ? "To be paid" : "Input tax credit"}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Filing Status</CardTitle>
                                {summary.filingStatus === "filed" ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : summary.filingStatus === "overdue" ? (
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                ) : (
                                    <FileText className="h-4 w-4 text-yellow-500" />
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <Badge variant={summary.filingStatus === "filed" ? "default" : summary.filingStatus === "overdue" ? "destructive" : "secondary"}>
                                        {summary.filingStatus.toUpperCase()}
                                    </Badge>
                                </div>
                                {summary.dueDate && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Due: {format(new Date(summary.dueDate), "MMM d, yyyy")}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Card className="col-span-full">
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No GST data available
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Recent GST Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Recent GST Transactions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {transactionsLoading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : transactions && transactions.length > 0 ? (
                        <div className="space-y-3">
                            {transactions.slice(0, 10).map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Badge variant={transaction.type === "sale" ? "default" : "secondary"}>
                                            {transaction.type.toUpperCase()}
                                        </Badge>
                                        <div>
                                            <p className="text-sm font-medium">{transaction.invoiceNumber}</p>
                                            <p className="text-xs text-muted-foreground">{format(new Date(transaction.date), "MMM d, yyyy")}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">${transaction.amount.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">
                                            GST ({(transaction.gstRate * 100).toFixed(0)}%): ${transaction.gstAmount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            No GST transactions found
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        AI GST Optimization Tips
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                            <LightbulbIcon className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Maximize Input Tax Credit</p>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                    Review all purchase invoices to ensure you&apos;re claiming maximum ITC. Consider categorizing expenses better.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                            <LightbulbIcon className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-green-900 dark:text-green-100">Filing Timeline Optimization</p>
                                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                    File GSTR-1 by the 11th to avoid late fees. Set up automated reminders for upcoming deadlines.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
                            <LightbulbIcon className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Reconciliation Alert</p>
                                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                    3 invoices mismatch found between GSTR-2A and your books. Review and reconcile before filing.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function LightbulbIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    );
}
