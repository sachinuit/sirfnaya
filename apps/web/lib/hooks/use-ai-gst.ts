"use client";

import { useEffect, useState } from "react";
import { getGSTSummary, getGSTTransactions, GSTSummary, GSTTransaction } from "@/lib/ai/ai-services";

export function useGSTSummary(period: string = "current-month") {
    const [data, setData] = useState<GSTSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchSummary() {
            try {
                setIsLoading(true);
                const summary = await getGSTSummary(period);
                setData(summary);
            } catch (err) {
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchSummary();
    }, [period]);

    return { data, isLoading, error };
}

export function useGSTTransactions(period: string = "current-month") {
    const [data, setData] = useState<GSTTransaction[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchTransactions() {
            try {
                setIsLoading(true);
                const transactions = await getGSTTransactions(period);
                setData(transactions);
            } catch (err) {
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTransactions();
    }, [period]);

    return { data, isLoading, error };
}
