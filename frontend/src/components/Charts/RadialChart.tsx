import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface RadialChartProps {
    series: number[];
    labels: string[];
    colors?: string[];
    height?: number | string;
    centerLabel?: string;
    centerValue?: string;
    onSelection?: (index: number) => void;
}

const RadialChart: React.FC<RadialChartProps> = ({
    series,
    labels,
    colors = ['#5D87FF', '#49BEFF', '#13DEB9', '#FFAE1F', '#FA896B'],
    height = 400,
    centerLabel = 'Total',
    centerValue,
    onSelection
}) => {
    const options: ApexOptions = useMemo(() => ({
        chart: {
            type: 'radialBar',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            toolbar: { show: false },
            events: {
                dataPointSelection: (_event, _chartContext, config) => {
                    if (onSelection) {
                        onSelection(config.dataPointIndex);
                    }
                }
            }
        },
        plotOptions: {
            radialBar: {
                offsetY: 0,
                startAngle: 0,
                endAngle: 270,
                hollow: {
                    margin: 5,
                    size: '35%',
                    background: 'transparent',
                },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#5A6A83',
                    },
                    value: {
                        show: true,
                        fontSize: '22px',
                        fontWeight: 800,
                        color: '#2A3547',
                        formatter: (val: number) => `${val}%`
                    },
                    total: {
                        show: true,
                        label: centerLabel,
                        formatter: () => centerValue || ''
                    }
                }
            }
        },
        colors: colors,
        labels: labels,
        legend: {
            show: true,
            floating: true,
            fontSize: '12px',
            position: 'left',
            offsetX: 0,
            offsetY: 15,
            labels: { useSeriesColors: true },
            markers: { size: 0 },
            formatter: (seriesName, opts) => {
                return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex] + "%";
            },
            itemMargin: { vertical: 3 }
        },
        stroke: {
            lineCap: 'round'
        },
        tooltip: {
            enabled: true,
            theme: 'dark'
        }
    }), [colors, labels, centerLabel, centerValue, onSelection]);

    return (
        <Chart
            options={options}
            series={series}
            type="radialBar"
            height={height}
            width="100%"
        />
    );
};

export default RadialChart;
