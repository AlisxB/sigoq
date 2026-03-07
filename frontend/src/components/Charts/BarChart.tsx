import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface BarChartProps {
    series: { name: string; data: number[] }[];
    categories: string[];
    colors?: string[];
    height?: number | string;
}

const BarChart: React.FC<BarChartProps> = ({
    series,
    categories,
    colors = ['#5D87FF', '#49BEFF', '#13DEB9', '#FFAE1F', '#FA896B'],
    height = 350
}) => {
    const options: ApexOptions = useMemo(() => ({
        chart: {
            type: 'bar',
            toolbar: { show: false },
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true,
                barHeight: '40%',
                distributed: true
            }
        },
        colors: colors,
        dataLabels: {
            enabled: true,
            textAnchor: 'start',
            style: {
                colors: ['#fff'],
                fontWeight: 700
            },
            formatter: (val, opt) => {
                return opt.w.globals.labels[opt.dataPointIndex] + ": " + val
            },
            offsetX: 0
        },
        xaxis: {
            categories: categories,
            labels: {
                show: false
            },
            axisBorder: { show: false },
            axisLine: { show: false }
        },
        yaxis: {
            labels: {
                show: true,
                style: {
                    fontWeight: 600,
                    colors: '#5A6A83'
                }
            }
        },
        grid: {
            borderColor: 'rgba(0,0,0,0.05)',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: false } }
        },
        tooltip: {
            theme: 'dark',
            y: {
                title: {
                    formatter: () => ''
                }
            }
        },
        legend: {
            show: false
        }
    }), [categories, colors]);

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

export default BarChart;
