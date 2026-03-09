import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, ShoppingBag, Target, Award,
    DollarSign, PieChart, Briefcase, ArrowRight,
    RefreshCw, Clock
} from 'lucide-react';
import { analyticsApi } from '../../../api/analytics';
import { useAuth } from '../../../contexts/AuthContext';
import RadialChart from '../../../components/Charts/RadialChart';
import DonutChart from '../../../components/Charts/DonutChart';
import StatCard from '../components/StatCard';

const SalesDashboardView: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const { data: rawFunnelData, isFetching: isFetchingFunnel } = useQuery({
        queryKey: ['analytics-funnel-personal'],
        queryFn: analyticsApi.getFunnel,
        staleTime: 1000 * 60 * 5,
        refetchInterval: 1000 * 60 * 5,
    });

    const funnelData: any[] = useMemo(() => {
        if (!rawFunnelData) return [];
        return Array.isArray(rawFunnelData) ? rawFunnelData : (rawFunnelData.results || []);
    }, [rawFunnelData]);

    const { data: financeData, isLoading: isLoadingFinance, isFetching: isFetchingFinance } = useQuery({
        queryKey: ['analytics-finance-personal'],
        queryFn: () => analyticsApi.getFinance(),
        staleTime: 1000 * 60 * 5,
        refetchInterval: 1000 * 60 * 5,
    });

    const isRefreshing = isFetchingFunnel || isFetchingFinance;

    const handleManualRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['analytics-funnel-personal'] });
        queryClient.invalidateQueries({ queryKey: ['analytics-finance-personal'] });
        setLastUpdated(new Date());
    };

    const totalFunnel = useMemo(() => {
        if (!Array.isArray(funnelData)) return 0;
        return funnelData.reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0);
    }, [funnelData]);

    // Memoized Chart Data
    const radialSeries = useMemo(() => {
        if (!funnelData || totalFunnel === 0) return [];
        return funnelData.map(d => Math.round((parseFloat(d.total) / totalFunnel) * 100));
    }, [funnelData, totalFunnel]);

    const radialLabels = useMemo(() => funnelData?.map(d => d.status__nome) || [], [funnelData]);
    const radialColors = useMemo(() => funnelData?.map(d => d.status__cor || '#5D87FF') || [], [funnelData]);

    const centerValue = useMemo(() => {
        const val = selectedIdx !== null && funnelData ? parseFloat(funnelData[selectedIdx].total) : totalFunnel;
        return "R$ " + (val / 1000).toFixed(0) + "k";
    }, [selectedIdx, funnelData, totalFunnel]);

    const centerLabel = useMemo(() => {
        return selectedIdx !== null && funnelData ? funnelData[selectedIdx].status__nome : 'Meu Funil';
    }, [selectedIdx, funnelData]);

    const leadSourceData = useMemo(() => {
        if (!financeData || !financeData.charts) return { series: [], labels: [] };
        return {
            series: financeData.charts.origem_leads.map(o => o.value),
            labels: financeData.charts.origem_leads.map(o => o.label)
        };
    }, [financeData]);

    if (isLoadingFinance) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <div style={{ padding: '0 5px' }}>
            <div className="d-flex justify-content-end align-items-center mb-3 gap-3 px-2">
                <div className="text-muted x-small fw-medium d-flex align-items-center opacity-75">
                    <Clock size={12} className="me-1" /> 
                    Dados de {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <Button 
                    variant="white" 
                    size="sm" 
                    className={`rounded-circle p-2 shadow-sm border bg-white ${isRefreshing ? 'refresh-spin' : ''}`}
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    title="Sincronizar meus dados"
                >
                    <RefreshCw size={16} className="text-primary" />
                </Button>
            </div>

            <Row className="mb-4 g-4">
                <Col lg={6}>
                    <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <Card.Body className="p-4 d-flex align-items-center">
                            <div className="flex-grow-1">
                                <h2 className="h4 fw-bold mb-1" style={{ color: '#2A3547' }}>Minha Performance</h2>
                                <p className="text-muted small mb-4">Olá, {user?.first_name}! Veja como estão suas vendas este mês.</p>
                                <div className="d-flex gap-2">
                                    <Button 
                                        onClick={() => navigate('/kanban')}
                                        className="btn-premium d-flex align-items-center" 
                                        style={{ backgroundColor: '#5D87FF', border: 'none' }}
                                    >
                                        <Briefcase size={16} className="me-2" /> Meu Pipeline
                                    </Button>
                                    <Button 
                                        variant="light"
                                        onClick={() => navigate('/clientes')}
                                        className="d-flex align-items-center fw-bold text-muted border" 
                                        style={{ borderRadius: '10px' }}
                                    >
                                        Meus Clientes <ArrowRight size={16} className="ms-2" />
                                    </Button>
                                </div>
                            </div>
                            <div className="d-none d-lg-block">
                                <img src="https://spike-angular-pro-main.netlify.app/assets/images/backgrounds/welcome-bg.png" alt="Welcome" style={{ height: '140px' }} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6}>
                    <StatCard 
                        title="Minhas Vendas" 
                        value={`R$ ${( (financeData?.kpis?.vendas_mes || 0) / 1000).toFixed(1)}k`} 
                        subtitle={`${financeData?.kpis?.meta_atingimento || 0}% da meta atingida`}
                        icon={<DollarSign size={22} color="white" />} 
                        bgColor="#5D87FF" 
                    />
                </Col>
                <Col lg={3} md={6}>
                    <StatCard 
                        title="Meta Mensal" 
                        value={`R$ ${( (financeData?.kpis?.meta_valor || 0) / 1000).toFixed(0)}k`} 
                        subtitle="Objetivo de faturamento"
                        icon={<Target size={22} color="white" />} 
                        bgColor="#2A3547" 
                    />
                </Col>
            </Row>

            <Row className="mb-4 g-4">
                <Col lg={3} md={6}>
                    <StatCard 
                        title="Meu Ticket Médio" 
                        value={`R$ ${( (financeData?.kpis?.ticket_medio || 0) / 1000).toFixed(1)}k`} 
                        subtitle={`Total de ${financeData?.kpis?.total_aprovados || 0} fechamentos`}
                        icon={<TrendingUp size={22} color="white" />} 
                        bgColor="#49BEFF" 
                    />
                </Col>
                <Col lg={3} md={6}>
                    <StatCard 
                        title="Margem Média" 
                        value={`${financeData?.kpis?.margem_media || 0}%`} 
                        subtitle="Saúde das negociações"
                        icon={<Award size={22} color="white" />} 
                        bgColor="#13DEB9" 
                    />
                </Col>
                <Col lg={6} md={12}>
                    <StatCard 
                        title="Meu Pipeline Ativo" 
                        value={`R$ ${( (financeData?.kpis?.pipeline_ativo_valor || 0) / 1000).toFixed(1)}k`} 
                        subtitle="Potencial total em aberto"
                        icon={<ShoppingBag size={22} color="white" />} 
                        bgColor="#7C8FAC" 
                    />
                </Col>
            </Row>

            <Row className="g-4 mb-4">
                <Col lg={7}>
                    <Card className="card-premium border-0 shadow-sm p-4 h-100" style={{ borderRadius: '24px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h3 className="h5 fw-bold mb-0">Meu Funil de Vendas</h3>
                            <PieChart size={20} className="text-muted" />
                        </div>
                        <p className="text-muted small mb-4">Representação percentual dos seus negócios por etapa.</p>
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                            <RadialChart
                                series={radialSeries}
                                labels={radialLabels}
                                colors={radialColors}
                                height={450}
                                centerLabel={centerLabel}
                                centerValue={centerValue}
                                onSelection={setSelectedIdx}
                            />
                        </div>
                    </Card>
                </Col>

                <Col lg={5}>
                    <Card className="card-premium border-0 shadow-sm p-4 h-100" style={{ borderRadius: '24px' }}>
                        <h3 className="h5 fw-bold mb-4">Origem dos Meus Leads</h3>
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                            <DonutChart 
                                series={leadSourceData.series}
                                labels={leadSourceData.labels}
                                height={350}
                                title="Meus Leads"
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .refresh-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default SalesDashboardView;
