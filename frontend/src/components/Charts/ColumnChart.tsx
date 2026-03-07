import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface ColumnChartProps {
    series: { name: string; data: number[] }[];
    categories: string[];
    colors?: string[];
    height?: number | string;
    showLegend?: boolean;
}

const ColumnChart: React.FC<ColumnChartProps> = ({
    series,
    categories,
    colors = ['#5D87FF', '#49BEFF', '#13DEB9', '#FFAE1F', '#FA896B'],
    height = 350,
    showLegend = false
}) => {
    const options: ApexOptions = useMemo(() => ({
        chart: {
            type: 'bar',
            toolbar: { show: false },
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                horizontal: false,
                columnWidth: '35%',
                distributed: true
            }
        },
        colors: colors,
        dataLabels: {
            enabled: false
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    fontWeight: 600,
                    colors: '#5A6A83'
                }
            },
            axisBorder: { show: false },
            axisLine: { show: false }
        },
        yaxis: {
            labels: { show: false }
        },
        grid: {
            borderColor: 'rgba(0,0,0,0.05)',
            strokeDashArray: 4,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } }
        },
        legend: {
            show: showLegend
        },
        tooltip: {
            theme: 'dark'
        }
    }), [categories, colors, showLegend]);

    return (
        <Chart
            options={options}
            series={series}
            type="bar"
            height={height}
            width="100%"
        />
    );
};

export default ColumnChart;
