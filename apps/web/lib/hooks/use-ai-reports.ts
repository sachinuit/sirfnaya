"use client";

import { useEffect, useState } from "react";
import { generateReport, ReportData } from "@/lib/ai/ai-services";

export function useAIReports() {
    const [data, setData] = useState<ReportData[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Mock data for demonstration
    useEffect(() => {
        const mockReports: ReportData[] = [
            {
                id: "1",
                title: "Monthly Sales Analysis",
                type: "sales",
                generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                data: {},
                insights: ["Sales increased by 15% compared to last month", "Top performing category: Smartphones"],
                charts: []
            },
            {
                id: "2",
                title: "Inventory Health Report",
                type: "inventory",
                generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                data: {},
                insights: ["5 products need immediate restocking", "Inventory turnover improved by 8%"],
                charts: []
            },
            {
                id: "3",
                title: "Customer Behavior Analysis",
                type: "customer",
                generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                data: {},
                insights: ["Customer retention rate: 78%", "Average order value increased by $25"],
                charts: []
            }
        ];
        setData(mockReports);
        setIsLoading(false);
    }, []);

    const generateReportFn = async (type: string, dateRange: { start: string; end: string }) => {
        try {
            setIsLoading(true);
            await generateReport(type, dateRange);
            // Refresh the list after generation
            const newReport: ReportData = {
                id: Date.now().toString(),
                title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
                type: type as any,
                generatedAt: new Date().toISOString(),
                data: {},
                insights: [],
                charts: []
            };
            setData(prev => prev ? [newReport, ...prev] : [newReport]);
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { data, isLoading, error, generateReport: generateReportFn };
}
