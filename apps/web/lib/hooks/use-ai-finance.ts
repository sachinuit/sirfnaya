"use client";

import { useEffect, useState } from "react";
import { getFinanceInsights, getRevenueForecast, analyzeExpenses, FinanceInsight, RevenueForecast } from "@/lib/ai/ai-services";

export function useFinanceInsights() {
    const [data, setData] = useState<FinanceInsight[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchInsights() {
            try {
                setIsLoading(true);
                const insights = await getFinanceInsights();
                setData(insights);
            } catch (err) {
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchInsights();
    }, []);

    return { data, isLoading, error };
}

export function useRevenueForecast(days: number = 30) {
    const [data, setData] = useState<RevenueForecast[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchForecast() {
            try {
                setIsLoading(true);
                const forecast = await getRevenueForecast(days);
                setData(forecast);
            } catch (err) {
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchForecast();
    }, [days]);

    return { data, isLoading, error };
}

export function useExpenseAnalysis() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchAnalysis() {
            try {
                setIsLoading(true);
                const analysis = await analyzeExpenses();
                setData(analysis);
            } catch (err) {
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAnalysis();
    }, []);

    return { data, isLoading, error };
}
