"use client";

import { createChart, ColorType } from "lightweight-charts";
import React, { useEffect, useRef } from "react";

interface SparklineProps {
    data: { time: string; value: number }[];
    color?: string;
}

export function WatchlistSparkline({ data, color = "#22c55e" }: SparklineProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: "transparent" },
                textColor: "transparent",
            },
            width: chartContainerRef.current.clientWidth,
            height: 50,
            grid: {
                vertLines: { visible: false },
                horzLines: { visible: false },
            },
            rightPriceScale: {
                visible: false,
            },
            timeScale: {
                visible: false,
            },
            handleScroll: false,
            handleScale: false,
        });

        const newSeries = chart.addLineSeries({
            color: color,
            lineWidth: 2,
            crosshairMarkerVisible: false,
            priceLineVisible: false,
        });

        // innovative use of sorting to ensure time is ascending which is required by library
        const sortedData = [...data].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

        // Ensure unique times
        const uniqueData: { time: string; value: number }[] = [];
        const times = new Set();
        for (const d of sortedData) {
            if (!times.has(d.time)) {
                times.add(d.time);
                uniqueData.push(d);
            }
        }

        newSeries.setData(uniqueData);

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
        };
    }, [data, color]);

    return <div ref={chartContainerRef} className="w-full h-[50px]" />;
}
