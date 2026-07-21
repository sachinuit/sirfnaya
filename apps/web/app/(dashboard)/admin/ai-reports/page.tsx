"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, FileText, BarChart3, Clock, Download, Calendar, Users, ShoppingCart } from "lucide-react";
import { useAIReports } from "@/lib/hooks/use-ai-reports";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts";

export default function AIReportsPage() {
    const { data: reports, isLoading, generateReport } = useAIReports();

    const handleGenerateReport = async (type: string) => {
        try {
            toast.info(`Generating ${type} report...`);
            await generateReport(type, {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                end: new Date().toISOString()
            });
            toast.success(`${type} report generated successfully!`);
        } catch (error) {
            toast.error(`Failed to generate ${type} report`);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-[family-name:var(--font-heading)] flex items-center gap-3">
                        <Brain className="h-8 w-8 text-primary" />
                        AI Reporting System
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Automated intelligent reports with actionable insights and predictions
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => handleGenerateReport("sales")}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Sales Report
                    </Button>
                    <Button variant="outline" onClick={() => handleGenerateReport("inventory")}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Inventory Report
                    </Button>
                    <Button variant="outline" onClick={() => handleGenerateReport("customer")}>
                        <Users className="h-4 w-4 mr-2" />
                        Customer Report
                    </Button>
                    <Button variant="outline" onClick={() => handleGenerateReport("financial")}>
                        <FileText className="h-4 w-4 mr-2" />
                        Financial Report
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reports?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Generated this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
                        <Brain className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground">Actionable recommendations</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
                        <Clock className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12.5 hrs</div>
                        <p className="text-xs text-muted-foreground">vs manual reporting</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                        <BarChart3 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">98.7%</div>
                        <p className="text-xs text-muted-foreground">Prediction accuracy</p>
                    </CardContent>
                </Card>
            </div>

            {/* Report Generation Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Generate Custom Report
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Report Type</label>
                            <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="sales">Sales Report</option>
                                <option value="inventory">Inventory Report</option>
                                <option value="customer">Customer Report</option>
                                <option value="financial">Financial Report</option>
                                <option value="custom">Custom Report</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Date</label>
                            <input type="date" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">End Date</label>
                            <input type="date" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                        </div>
                        <div className="flex items-end">
                            <Button className="w-full">
                                <Download className="h-4 w-4 mr-2" />
                                Generate Report
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Recent AI-Generated Reports
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : reports && reports.length > 0 ? (
                        <div className="space-y-3">
                            {reports.map((report) => (
                                <div key={report.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            {report.type === "sales" ? (
                                                <BarChart3 className="h-5 w-5" />
                                            ) : report.type === "inventory" ? (
                                                <ShoppingCart className="h-5 w-5" />
                                            ) : report.type === "customer" ? (
                                                <Users className="h-5 w-5" />
                                            ) : (
                                                <FileText className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{report.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Generated {format(new Date(report.generatedAt), "MMM d, yyyy 'at' h:mm a")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">{report.type}</Badge>
                                        <Button variant="ghost" size="sm">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            No reports generated yet
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Sample Analytics Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        AI-Powered Sales Analytics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[
                                { date: "Jan", actual: 4000, predicted: 3800 },
                                { date: "Feb", actual: 3000, predicted: 3200 },
                                { date: "Mar", actual: 5000, predicted: 4800 },
                                { date: "Apr", actual: 4500, predicted: 4600 },
                                { date: "May", actual: 6000, predicted: 5800 },
                                { date: "Jun", actual: 5500, predicted: 5700 },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                />
                                <Line type="monotone" dataKey="actual" stroke="#8884d8" strokeWidth={2} dot={false} name="Actual" />
                                <Line type="monotone" dataKey="predicted" stroke="#82ca9d" strokeWidth={2} strokeDasharray="5 5" dot={false} name="AI Predicted" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
