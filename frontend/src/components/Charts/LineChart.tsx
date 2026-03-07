import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface LineChartProps {
    series: { name: string; data: number[] }[];
    categories: string[];
    colors?: string[];
    height?: number | string;
    showGrid?: boolean;
    curve?: 'smooth' | 'straight' | 'stepline';
}

const LineChart: React.FC<LineChartProps> = ({
    series,
    categories,
    colors = ['#5D87FF', '#49BEFF', '#13DEB9', '#FFAE1F', '#FA896B'],
    height = 350,
    showGrid = true,
    curve = 'smooth'
}) => {
    const options: ApexOptions = useMemo(() => ({
        chart: {
            type: 'line',
            toolbar: { show: false },
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            dropShadow: {
                enabled: true,
                color: '#000',
                top: 18,
                left: 7,
                blur: 10,
                opacity: 0.05
            }
        },
        colors: colors,
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: curve,
            width: 3
        },
        grid: {
            borderColor: 'rgba(0,0,0,0.05)',
            show: showGrid,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } }
        },
        markers: {
            size: 4,
            strokeColors: colors,
            strokeWidth: 2,
            hover: { size: 7 }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: { fontWeight: 600, colors: '#5A6A83' }
            },
            axisBorder: { show: false },
            axisLine: { show: false }
        },
        yaxis: {
            labels: {
                style: { fontWeight: 600, colors: '#5A6A83' },
                formatter: (val) => val.toLocaleString('pt-BR')
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            floating: true,
            offsetY: -25,
            offsetX: -5
        },
        tooltip: {
            theme: 'dark'
        }
    }), [categories, colors, showGrid, curve]);

    return (
        <Chart
            options={options}
            series={series}
            type="line"
            height={height}
            width="100%"
        />
    );
};

export default LineChart;
