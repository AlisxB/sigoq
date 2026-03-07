import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface DonutChartProps {
    series: number[];
    labels: string[];
    colors?: string[];
    height?: number | string;
    title?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
    series,
    labels,
    colors = ['#5D87FF', '#49BEFF', '#13DEB9', '#FFAE1F', '#FA896B'],
    height = 300,
    title
}) => {
    const options: ApexOptions = useMemo(() => ({
        chart: {
            type: 'donut',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            toolbar: { show: false }
        },
        labels: labels,
        colors: colors,
        legend: {
            position: 'bottom',
            fontSize: '13px',
            fontWeight: 600,
            labels: { colors: '#5A6A83' },
            markers: { radius: 12 }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        name: { show: true, fontSize: '14px', fontWeight: 600, color: '#5A6A83' },
                        value: { show: true, fontSize: '20px', fontWeight: 800, color: '#2A3547' },
                        total: {
                            show: true,
                            label: title || 'Total',
                            color: '#5A6A83',
                            formatter: (w) => {
                                const totals = w.globals.seriesTotals;
                                return Array.isArray(totals) 
                                    ? totals.reduce((a: number, b: number) => a + b, 0)
                                    : 0;
                            }
                        }
                    }
                }
            }
        },
        dataLabels: { enabled: false },
        stroke: { show: false },
        tooltip: { theme: 'dark' }
    }), [labels, colors, title]);

    return (
        <Chart
            options={options}
            series={series}
            type="donut"
            height={height}
            width="100%"
        />
    );
};

export default DonutChart;
