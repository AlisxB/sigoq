import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface AreaChartProps {
    series: { name: string; data: number[] }[];
    categories: string[];
    colors?: string[];
    height?: number | string;
    showGrid?: boolean;
}

const AreaChart: React.FC<AreaChartProps> = ({
    series,
    categories,
    colors = ['#5D87FF', '#49BEFF', '#13DEB9', '#FFAE1F', '#FA896B'],
    height = 350,
    showGrid = true
}) => {
    const options: ApexOptions = useMemo(() => ({
        chart: {
            type: 'area',
            toolbar: { show: false },
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        },
        colors: colors,
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [20, 100, 100, 100]
            }
        },
        grid: {
            borderColor: 'rgba(0,0,0,0.05)',
            show: showGrid,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } }
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
        tooltip: {
            theme: 'dark',
            x: { show: true }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right'
        }
    }), [categories, colors, showGrid]);

    return (
        <Chart
            options={options}
            series={series}
            type="area"
            height={height}
            width="100%"
        />
    );
};

export default AreaChart;
