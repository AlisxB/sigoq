import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Button, Spinner, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, ShoppingBag, Target, Award, MoreHorizontal, Settings,
    DollarSign, BarChart3, PieChart, Users, AlertTriangle, ArrowRight,
    ExternalLink, Briefcase
} from 'lucide-react';
import { analyticsApi } from '../api/analytics';
import { useAuth } from '../contexts/AuthContext';
import RadialChart from '../components/Charts/RadialChart';
import ColumnChart from '../components/Charts/ColumnChart';
import LineChart from '../components/Charts/LineChart';
import AreaChart from '../components/Charts/AreaChart';
import DonutChart from '../components/Charts/DonutChart';
import BarChart from '../components/Charts/BarChart';

const StatCard: React.FC<{ 
    title: string, 
    value: string | number, 
    subtitle?: string, 
    icon: React.ReactNode, 
    bgColor: string, 
    txtColor?: string,
    action?: React.ReactNode
}> = ({ title, value, subtitle, icon, bgColor, txtColor = '#FFFFFF', action }) => (
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
                <h3 className="h2 fw-extrabold mb-1" style={{ color: txtColor, letterSpacing: '-1px' }}>{value}</h3>
                <p className="mb-0 fw-bold" style={{ color: txtColor, opacity: 0.9, fontSize: '14px' }}>{title}</p>
                {subtitle && (
                    <div className="text-nowrap mt-1" style={{ color: txtColor, fontSize: '11px', opacity: 0.7, fontWeight: 600 }}>
                        {subtitle}
                    </div>
                )}
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
        return selectedIdx !== null && funnelData ? funnelData[selectedIdx].status__nome : 'Total Funil';
    }, [selectedIdx, funnelData]);

    const salesEvolutionData = useMemo(() => {
        if (!financeData) return { series: [], categories: [] };
        return {
            series: [{ name: 'Faturamento', data: financeData.charts.evolucao_mensal.map(e => e.total) }],
            categories: financeData.charts.evolucao_mensal.map(e => e.mes)
        };
    }, [financeData]);

    const categoryMix = useMemo(() => {
        if (!financeData) return { series: [], categories: [] };
        return {
            series: [{ name: 'Itens Vendidos', data: financeData.charts.mix_categorias.map(c => c.value) }],
            categories: financeData.charts.mix_categorias.map(c => c.label)
        };
    }, [financeData]);

    const leadSourceData = useMemo(() => {
        if (!financeData) return { series: [], labels: [] };
        return {
            series: financeData.charts.origem_leads.map(o => o.value),
            labels: financeData.charts.origem_leads.map(o => o.label)
        };
    }, [financeData]);

    const lostReasonsData = useMemo(() => {
        if (!financeData) return { series: [], labels: [] };
        return {
            series: financeData.charts.motivos_perda.map(m => m.value),
            labels: financeData.charts.motivos_perda.map(m => m.label)
        };
    }, [financeData]);

    if (isLoadingFunnel || isLoadingFinance) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <div style={{ padding: '0 5px' }}>
            {/* TOP BAR: Welcome & Meta */}
            <Row className="mb-4 g-4">
                <Col xl={4} lg={6}>
                    <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <Card.Body className="p-4 d-flex align-items-center">
                            <div className="flex-grow-1">
                                <h2 className="h4 fw-bold mb-1" style={{ color: '#2A3547' }}>Painel Gerencial</h2>
                                <p className="text-muted small mb-4">Olá, {user?.first_name}! Acompanhe os indicadores estratégicos do SIGOQ.</p>
                                <div className="d-flex gap-2">
                                    <Button 
                                        onClick={() => navigate('/kanban')}
                                        className="btn-premium d-flex align-items-center" 
                                        style={{ backgroundColor: '#5D87FF', border: 'none' }}
                                    >
                                        <Briefcase size={16} className="me-2" /> Pipeline
                                    </Button>
                                    <Button 
                                        variant="light"
                                        onClick={() => navigate('/orcamentos')}
                                        className="d-flex align-items-center fw-bold text-muted border" 
                                        style={{ borderRadius: '10px' }}
                                    >
                                        Orçamentos <ArrowRight size={16} className="ms-2" />
                                    </Button>
                                </div>
                            </div>
                            <div className="d-none d-xxl-block">
                                <img src="https://spike-angular-pro-main.netlify.app/assets/images/backgrounds/welcome-bg.png" alt="Welcome" style={{ height: '120px' }} />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xl={2} lg={3} md={6}>
                    <StatCard 
                        title="Faturamento Mês" 
                        value={`R$ ${(financeData?.kpis.vendas_mes! / 1000).toFixed(1)}k`} 
                        subtitle={`${financeData?.kpis.meta_atingimento}% da meta atingida`}
                        icon={<DollarSign size={22} color="white" />} 
                        bgColor="#5D87FF" 
                    />
                </Col>
                <Col xl={2} lg={3} md={6}>
                    <StatCard 
                        title="Ticket Médio" 
                        value={`R$ ${(financeData?.kpis.ticket_medio! / 1000).toFixed(1)}k`} 
                        subtitle={`Baseado em ${financeData?.kpis.total_aprovados} vendas`}
                        icon={<TrendingUp size={22} color="white" />} 
                        bgColor="#49BEFF" 
                    />
                </Col>
                <Col xl={2} lg={3} md={6}>
                    <StatCard 
                        title="Margem Média" 
                        value={`${financeData?.kpis.margem_media}%`} 
                        subtitle={financeData?.kpis.margem_media! >= 20 ? 'Meta saudável' : 'Alerta de lucratividade'}
                        icon={<Award size={22} color="white" />} 
                        bgColor="#13DEB9" 
                    />
                </Col>
                <Col xl={2} lg={3} md={6}>
                    <StatCard 
                        title="Pipeline Ativo" 
                        value={`R$ ${(financeData?.kpis.pipeline_ativo_valor! / 1000000).toFixed(1)}M`} 
                        subtitle="Potencial de fechamento"
                        icon={<ShoppingBag size={22} color="white" />} 
                        bgColor="#2A3547" 
                    />
                </Col>
            </Row>

            {/* MAIN CHARTS: Evolution & Pipeline */}
            <Row className="g-4 mb-4">
                <Col lg={8}>
                    <Card className="card-premium border-0 shadow-sm p-4 h-100" style={{ borderRadius: '24px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="h5 fw-bold mb-0">Evolução de Faturamento</h3>
                                <p className="text-muted small mb-0">Desempenho de vendas aprovadas nos últimos 6 meses.</p>
                            </div>
                            <Button variant="light" size="sm" className="rounded-8 border"><BarChart3 size={16} /></Button>
                        </div>
                        <div style={{ height: '350px' }}>
                            <AreaChart 
                                series={salesEvolutionData.series}
                                categories={salesEvolutionData.categories}
                                height={350}
                                colors={['#5D87FF']}
                            />
                        </div>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="card-premium border-0 shadow-sm p-4 h-100" style={{ borderRadius: '24px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h3 className="h5 fw-bold mb-0">Pipeline por Status</h3>
                            <PieChart size={20} className="text-muted" />
                        </div>
                        <p className="text-muted small mb-4">Distribuição financeira por etapa.</p>
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '350px' }}>
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
            </Row>

            {/* SECONDARY CHARTS: Sources, Reasons & Mix */}
            <Row className="g-4 mb-4">
                <Col lg={4}>
                    <Card className="card-premium border-0 shadow-sm p-4" style={{ borderRadius: '24px' }}>
                        <h3 className="h5 fw-bold mb-4">Origem de Leads</h3>
                        <DonutChart 
                            series={leadSourceData.series}
                            labels={leadSourceData.labels}
                            height={300}
                            title="Leads"
                        />
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="card-premium border-0 shadow-sm p-4" style={{ borderRadius: '24px' }}>
                        <h3 className="h5 fw-bold mb-4">Motivos de Perda</h3>
                        <DonutChart 
                            series={lostReasonsData.series}
                            labels={lostReasonsData.labels}
                            colors={['#FA896B', '#FFAE1F', '#7C8FAC', '#5D87FF', '#49BEFF']}
                            height={300}
                            title="Perdas"
                        />
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="card-premium border-0 shadow-sm p-4" style={{ borderRadius: '24px' }}>
                        <h3 className="h5 fw-bold mb-4">Mix por Categoria</h3>
                        <BarChart 
                            series={categoryMix.series}
                            categories={categoryMix.categories}
                            height={300}
                        />
                    </Card>
                </Col>
            </Row>

            {/* STRATEGIC TABLES: Pareto & Alerts */}
            <Row className="g-4 mb-4 pb-5">
                <Col lg={7}>
                    <Card className="card-premium border-0 shadow-sm overflow-hidden" style={{ borderRadius: '24px' }}>
                        <div className="p-4 bg-white d-flex justify-content-between align-items-center border-bottom">
                            <h3 className="h5 fw-bold mb-0">Top 10 Clientes (Pareto)</h3>
                            <Users size={20} className="text-primary" />
                        </div>
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4 py-3 text-muted x-small fw-bold">CLIENTE</th>
                                    <th className="text-end pe-4 py-3 text-muted x-small fw-bold">TOTAL COMPRADO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {financeData?.ranking_clientes.map((c, i) => (
                                    <tr key={i}>
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-primary-light text-primary rounded-8 p-2 me-3 fw-bold x-small" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {i + 1}
                                                </div>
                                                <span className="fw-bold text-dark">{c.nome}</span>
                                            </div>
                                        </td>
                                        <td className="text-end pe-4 fw-extrabold text-success">
                                            R$ {c.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                </Col>

                <Col lg={5}>
                    <Card className="card-premium border-0 shadow-sm overflow-hidden h-100" style={{ borderRadius: '24px' }}>
                        <div className="p-4 bg-white d-flex justify-content-between align-items-center border-bottom">
                            <div className="d-flex align-items-center">
                                <h3 className="h5 fw-bold mb-0">Alertas de Estagnação</h3>
                                <Badge bg="danger" className="ms-3 rounded-pill px-2">{financeData?.kpis.total_estagnadas}</Badge>
                            </div>
                            <AlertTriangle size={20} className="text-warning" />
                        </div>
                        <Card.Body className="p-0">
                            {financeData?.alertas.estagnadas.length === 0 ? (
                                <div className="text-center py-5 text-muted italic">
                                    <TrendingUp size={48} className="opacity-10 mb-2" />
                                    <p>Nenhuma oportunidade estagnada. Equipe em dia!</p>
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {financeData?.alertas.estagnadas.map(op => (
                                        <div key={op.id} className="list-group-item p-4 border-bottom border-light hover-bg-light cursor-pointer" onClick={() => navigate('/kanban')}>
                                            <div className="d-flex justify-content-between align-items-start mb-1">
                                                <span className="x-small fw-bold text-muted">OP-{op.numero.toString().padStart(4, '0')}</span>
                                                <Badge bg="danger-subtle" className="text-danger x-small rounded-pill">
                                                    {op.dias_parado} dias parado
                                                </Badge>
                                            </div>
                                            <h6 className="fw-bold text-dark mb-2">{op.titulo}</h6>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="text-success fw-bold small">R$ {op.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                <ExternalLink size={14} className="text-muted" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                        <Card.Footer className="bg-white border-0 p-4 text-center">
                            <Button variant="link" className="text-primary fw-bold text-decoration-none" onClick={() => navigate('/kanban')}>
                                VER TODAS NO KANBAN
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            <style>{`
                .card-premium { border: 1px solid rgba(0,0,0,0.05) !important; transition: transform 0.2s; }
                .hover-bg-light:hover { background-color: #f8fafc; }
                .bg-primary-light { background-color: rgba(93, 135, 255, 0.1); }
                .rounded-8 { border-radius: 8px !important; }
                .x-small { font-size: 0.7rem; }
                .italic { font-style: italic; }
            `}</style>
        </div>
    );
};

export default Dashboard;
