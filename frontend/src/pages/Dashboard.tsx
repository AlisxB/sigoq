import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import {
    TrendingUp, ShoppingBag, Target, Award, MoreHorizontal, Settings
} from 'lucide-react';
import { analyticsApi } from '../api/analytics';
import { useAuth } from '../contexts/AuthContext';

const StatCard: React.FC<{ 
    title: string, 
    value: string, 
    change: string, 
    icon: React.ReactNode, 
    bgColor: string, 
    txtColor?: string,
    action?: React.ReactNode
}> = ({ title, value, change, icon, bgColor, txtColor = '#FFFFFF', action }) => (
    <Card className="h-100 border-0 overflow-hidden shadow-none" style={{ backgroundColor: bgColor, borderRadius: '24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-15px', right: '-15px', opacity: 0.1 }}>
            <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="50" fill="white" />
            </svg>
        </div>
        <Card.Body className="p-4 d-flex flex-column justify-content-between position-relative" style={{ zIndex: 1 }}>
            <div className="d-flex justify-content-between align-items-start">
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                    {icon}
                </div>
                {action}
            </div>
            <div>
                <h3 className="h1 fw-bold mb-1" style={{ color: txtColor, letterSpacing: '-1px' }}>{value}</h3>
                <p className="mb-0 fw-medium" style={{ color: txtColor, opacity: 0.8, fontSize: '14px' }}>{title}</p>
                <div className="d-flex align-items-center gap-1 mt-2 fw-bold" style={{ color: txtColor, fontSize: '13px' }}>
                    <TrendingUp size={14} /> {change}
                </div>
            </div>
        </Card.Body>
    </Card>
);

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    const { data: funnelData, isLoading: isLoadingFunnel } = useQuery({
        queryKey: ['analytics-funnel'],
        queryFn: analyticsApi.getFunnel,
        staleTime: 1000 * 60 * 5,
    });

    const { data: financeData, isLoading: isLoadingFinance } = useQuery({
        queryKey: ['analytics-finance'],
        queryFn: analyticsApi.getFinance,
        staleTime: 1000 * 60 * 5,
    });

    const totalFunnel = funnelData?.reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0) || 0;
    const margemAtual = (parseFloat(financeData?.margem_media || '0') * 100);

    // Configuração do Radial Bar (Pipeline)
    const radialOptions: any = useMemo(() => ({
        chart: {
            height: 380,
            type: 'radialBar',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            events: {
                dataPointSelection: (event: any, chartContext: any, config: any) => {
                    const idx = config.dataPointIndex;
                    setSelectedIdx(selectedIdx === idx ? null : idx);
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
                    image: undefined,
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
                        formatter: function (val: number, opt: any) {
                            const idx = opt.config.series.indexOf(val);
                            const realVal = funnelData ? parseFloat(funnelData[idx]?.total || 0) : 0;
                            return "R$ " + (realVal / 1000).toFixed(1) + "k";
                        }
                    },
                    total: {
                        show: true,
                        label: selectedIdx !== null && funnelData ? funnelData[selectedIdx].status__nome : 'Total Funil',
                        formatter: function (w: any) {
                            const val = selectedIdx !== null && funnelData ? parseFloat(funnelData[selectedIdx].total) : totalFunnel;
                            return "R$ " + (val / 1000).toFixed(0) + "k";
                        }
                    }
                }
            }
        },
        colors: funnelData?.map(d => d.status__cor || '#5D87FF') || ['#5D87FF'],
        labels: funnelData?.map(d => d.status__nome) || [],
        legend: {
            show: true,
            floating: true,
            fontSize: '12px',
            position: 'left',
            offsetX: 0,
            offsetY: 15,
            labels: { useSeriesColors: true },
            markers: { size: 0 },
            formatter: function (seriesName: string, opts: any) {
                return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex] + "%";
            },
            itemMargin: { vertical: 3 }
        },
    }), [funnelData, selectedIdx, totalFunnel]);

    const radialSeries = useMemo(() => {
        if (!funnelData || totalFunnel === 0) return [];
        return funnelData.map(d => Math.round((parseFloat(d.total) / totalFunnel) * 100));
    }, [funnelData, totalFunnel]);

    const categoryChartOptions: any = useMemo(() => ({
        chart: { type: 'bar', toolbar: { show: false }, fontFamily: "'Plus Jakarta Sans', sans-serif" },
        plotOptions: {
            bar: { borderRadius: 6, horizontal: false, columnWidth: '35%', distributed: true }
        },
        colors: ['#5D87FF', '#49BEFF', '#13DEB9', '#FFAE1F', '#FA896B'],
        dataLabels: { enabled: false },
        xaxis: {
            categories: financeData?.categorias.map((c: any) => c.produto__categoria__nome) || [],
            labels: { style: { fontWeight: 600, colors: '#5A6A83' } },
            axisBorder: { show: false },
            axisLine: { show: false }
        },
        yaxis: { labels: { show: false } },
        grid: { borderColor: 'rgba(0,0,0,0.05)', strokeDashArray: 4, vertical: false },
        legend: { show: false },
        tooltip: { theme: 'dark' }
    }), [financeData]);

    if (isLoadingFunnel || isLoadingFinance) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <div style={{ padding: '0 5px' }}>
            <Row className="mb-4 g-4 overflow-hidden">
                <Col md={5} lg={5}>
                    <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <Card.Body className="p-4 d-flex align-items-center">
                            <div className="flex-grow-1">
                                <h2 className="h4 fw-bold mb-1" style={{ color: '#2A3547' }}>Estatísticas Estratégicas</h2>
                                <p className="text-muted small mb-4">Bem-vindo, {user?.first_name}! Veja o desempenho hoje.</p>
                                <Button 
                                    onClick={() => navigate('/kanban')}
                                    className="px-4 py-2 fw-bold d-flex align-items-center" 
                                    style={{ backgroundColor: '#5D87FF', border: 'none', borderRadius: '10px', boxShadow: '0 4px 10px rgba(93,135,255,0.3)' }}
                                >
                                    <Target size={18} className="me-2" /> Gerenciar Funil
                                </Button>
                            </div>
                            <div className="d-none d-lg-block">
                                <img src="https://spike-angular-pro-main.netlify.app/assets/images/backgrounds/welcome-bg.png" alt="Welcome" style={{ height: '140px' }} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={2} lg={2}>
                    <StatCard title="Total Funil" value={`R$${(totalFunnel / 1000).toFixed(0)}k`} change="+12%" icon={<ShoppingBag size={22} color="white" />} bgColor="#5D87FF" />
                </Col>
                <Col md={2} lg={2}>
                    <StatCard 
                        title="Margem Média" 
                        value={`${margemAtual.toFixed(1)}%`} 
                        change={margemAtual >= 20 ? 'Alta' : 'Baixa'} 
                        icon={<Award size={22} color="white" />} 
                        bgColor="#49BEFF" 
                    />
                </Col>
                <Col md={3} lg={3}>
                    <StatCard 
                        title="Meta Mensal" 
                        value={`${financeData?.meta?.percentual_atingimento || 0}%`} 
                        change={`R$ ${(financeData?.meta?.valor_venda_mes / 1000).toFixed(1)}k de R$ ${(financeData?.meta?.valor_meta_configurada / 1000).toFixed(0)}k`}
                        icon={<TrendingUp size={22} color="white" />} 
                        bgColor="#2A3547" 
                        action={user?.role === 'ADMIN' && (
                            <Button 
                                variant="link" 
                                className="p-0 text-white opacity-50 hover-opacity-100" 
                                onClick={(e) => { e.stopPropagation(); navigate('/metas'); }}
                            >
                                <Settings size={18} />
                            </Button>
                        )}
                    />
                </Col>
            </Row>

            <Row className="g-4 mb-4">
                <Col lg={5}>
                    <Card className="border-0 shadow-sm p-4 h-100" style={{ borderRadius: '24px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h3 className="h5 fw-bold mb-0">Pipeline Comercial</h3>
                            <Button variant="link" className="p-0 text-muted"><MoreHorizontal size={20} /></Button>
                        </div>
                        <p className="text-muted small mb-4">Anéis representam o percentual financeiro de cada etapa sobre o total do funil.</p>
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '350px' }}>
                            <Chart
                                options={radialOptions}
                                series={radialSeries}
                                type="radialBar"
                                height={400}
                                width="100%"
                            />
                        </div>
                    </Card>
                </Col>

                <Col lg={7}>
                    <Card className="border-0 shadow-sm p-4 h-100" style={{ borderRadius: '24px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h3 className="h5 fw-bold mb-0">Mix por Categoria</h3>
                            <Button variant="link" className="p-0 text-muted"><MoreHorizontal size={20} /></Button>
                        </div>
                        <p className="text-muted small mb-4">Volume total de itens convertidos em vendas para cada categoria técnica.</p>
                        <div className="d-flex align-items-center justify-content-center" style={{ height: '320px' }}>
                            <Chart
                                options={categoryChartOptions}
                                series={[{ name: 'Orçamentos', data: financeData?.categorias.map((c: any) => c.total) || [] }]}
                                type="bar"
                                height={350}
                                width="100%"
                            />
                        </div>
                    </Card>
                </Col>
            </Row>
            <style>{`
                .hover-opacity-100:hover { opacity: 1 !important; transition: 0.2s; }
            `}</style>
        </div>
    );
};

export default Dashboard;
