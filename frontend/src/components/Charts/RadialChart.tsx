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
            offsetY: 0,
            sparkline: {
                enabled: false // Mantemos falso para as legendas aparecerem corretamente
            },
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
                startAngle: 0,
                endAngle: 360,
                offsetY: 0,
                hollow: {
                    margin: 0,
                    size: '40%',
                    background: 'transparent',
                },
                track: {
                    background: '#F2F6FA',
                    strokeWidth: '100%',
                    margin: 5, 
                },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#5A6A83',
                        offsetY: -10
                    },
                    value: {
                        show: true,
                        fontSize: '22px',
                        fontWeight: 800,
                        color: '#2A3547',
                        offsetY: 10,
                        formatter: (val: number) => `${val}%`
                    },
                    total: {
                        show: true,
                        label: centerLabel,
                        color: '#5A6A83',
                        fontSize: '14px',
                        fontWeight: 600,
                        formatter: () => centerValue || ''
                    }
                }
            }
        },
        colors: colors,
        labels: labels,
        legend: {
            show: true,
            position: 'left',
            horizontalAlign: 'center',
            fontSize: '14px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 600,
            offsetX: -10,
            offsetY: 0,
            labels: {
                colors: '#5A6A83',
                useSeriesColors: false
            },
            markers: {
                radius: 12,
                offsetX: -5
            },
            itemMargin: {
                horizontal: 0,
                vertical: 8
            },
            formatter: (seriesName, opts) => {
                return `${seriesName}: ${opts.w.globals.series[opts.seriesIndex]}%`;
            }
        },
        stroke: {
            lineCap: 'round'
        }
    }), [colors, labels, centerLabel, centerValue, onSelection]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Chart
                options={options}
                series={series}
                type="radialBar"
                height={height}
                width="100%"
            />
        </div>
    );
};

export default RadialChart;
