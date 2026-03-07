import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Row, Col, Card, Button, Spinner, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Compass, Clock, CheckCircle,
    PlayCircle, Edit, Layers, RefreshCw
} from 'lucide-react';
import { analyticsApi } from '../../../api/analytics';
import { orcamentoApi } from '../../../api/orcamentos';
import { useAuth } from '../../../contexts/AuthContext';
import BarChart from '../../../components/Charts/BarChart';
import StatCard from '../components/StatCard';

const TechnicalDashboardView: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const { data: analyticsData, isLoading: isLoadingAnalytics, isFetching: isFetchingAnalytics } = useQuery({
        queryKey: ['analytics-finance-tech'],
        queryFn: analyticsApi.getFinance,
        staleTime: 1000 * 60 * 5,
        refetchInterval: 1000 * 60 * 5,
    });

    const { data: orcamentos = [], isLoading: isLoadingOrcs, isFetching: isFetchingOrcs } = useQuery({
        queryKey: ['orcamentos-tech-queue'],
        queryFn: orcamentoApi.list,
        refetchInterval: 1000 * 60 * 5,
    });

    const isRefreshing = isFetchingAnalytics || isFetchingOrcs;

    const handleManualRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['analytics-finance-tech'] });
        queryClient.invalidateQueries({ queryKey: ['orcamentos-tech-queue'] });
        setLastUpdated(new Date());
    };

    const categoryMix = useMemo(() => {
        if (!analyticsData || !analyticsData.charts) return { series: [], categories: [] };
        return {
            series: [{ name: 'Itens Vendidos', data: analyticsData.charts.mix_categorias.map(c => c.value) }],
            categories: analyticsData.charts.mix_categorias.map(c => c.label)
        };
    }, [analyticsData]);

    const activeQueue = useMemo(() => {
        return orcamentos.filter(o => ['ELABORACAO', 'REVISAO'].includes(o.status)).slice(0, 5);
    }, [orcamentos]);

    if (isLoadingAnalytics || isLoadingOrcs) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <div style={{ padding: '0 5px' }}>
            <div className="d-flex justify-content-end align-items-center mb-3 gap-3 px-2">
                <div className="text-muted x-small fw-medium d-flex align-items-center opacity-75">
                    <Clock size={12} className="me-1" /> 
                    Fila atualizada às {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <Button 
                    variant="white" 
                    size="sm" 
                    className={`rounded-circle p-2 shadow-sm border bg-white ${isRefreshing ? 'refresh-spin' : ''}`}
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    title="Atualizar fila de trabalho"
                >
                    <RefreshCw size={16} className="text-primary" />
                </Button>
            </div>

            <Row className="mb-4 g-4">
                <Col lg={6}>
                    <Card className="h-100 border-0 shadow-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <Card.Body className="p-4 d-flex align-items-center">
                            <div className="flex-grow-1">
                                <h2 className="h4 fw-bold mb-1" style={{ color: '#2A3547' }}>Engenharia e Orçamentos</h2>
                                <p className="text-muted small mb-4">Olá, {user?.first_name}! Você tem {analyticsData?.kpis.em_elaboracao} orçamentos pendentes de detalhamento técnico.</p>
                                <div className="d-flex gap-2">
                                    <Button 
                                        onClick={() => navigate('/orcamentos')}
                                        className="btn-premium d-flex align-items-center" 
                                        style={{ backgroundColor: '#5D87FF', border: 'none' }}
                                    >
                                        <FileText size={16} className="me-2" /> Fila de Trabalho
                                    </Button>
                                    <Button 
                                        variant="light"
                                        onClick={() => navigate('/materiais')}
                                        className="d-flex align-items-center fw-bold text-muted border" 
                                        style={{ borderRadius: '10px' }}
                                    >
                                        Materiais <Compass size={16} className="ms-2" />
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
                        title="Em Elaboração" 
                        value={analyticsData?.kpis.em_elaboracao || 0} 
                        subtitle="Aguardando definições"
                        icon={<Edit size={22} color="white" />} 
                        bgColor="#FFAE1F" 
                    />
                </Col>
                <Col lg={3} md={6}>
                    <StatCard 
                        title="Em Revisão" 
                        value={analyticsData?.kpis.em_revisao || 0} 
                        subtitle="Prontos para validar"
                        icon={<CheckCircle size={22} color="white" />} 
                        bgColor="#13DEB9" 
                    />
                </Col>
            </Row>

            <Row className="g-4 mb-4">
                <Col lg={7}>
                    <Card className="card-premium border-0 shadow-sm overflow-hidden h-100" style={{ borderRadius: '24px' }}>
                        <div className="p-4 bg-white d-flex justify-content-between align-items-center border-bottom">
                            <h3 className="h5 fw-bold mb-0">Próximos Orçamentos na Fila</h3>
                            <Clock size={20} className="text-warning" />
                        </div>
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4 py-3 text-muted x-small fw-bold">ORÇAMENTO / CLIENTE</th>
                                    <th className="py-3 text-muted x-small fw-bold">STATUS</th>
                                    <th className="text-end pe-4 py-3 text-muted x-small fw-bold">AÇÃO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeQueue.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-5 text-muted italic">Sua fila está vazia. Ótimo trabalho!</td>
                                    </tr>
                                ) : (
                                    activeQueue.map((orc) => (
                                        <tr key={orc.id}>
                                            <td className="ps-4 py-3">
                                                <div className="fw-bold text-dark">ORC-{orc.numero.toString().padStart(4, '0')}</div>
                                                <div className="text-muted x-small">{orc.cliente_detalhe?.razao_social}</div>
                                            </td>
                                            <td>
                                                <Badge bg={orc.status === 'REVISAO' ? 'warning' : 'info'} className="rounded-pill">
                                                    {orc.status}
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-4">
                                                <Button 
                                                    variant="light" size="sm" className="text-primary rounded-8 border"
                                                    onClick={() => navigate(`/orcamento/${orc.id}`)}
                                                >
                                                    <PlayCircle size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </Card>
                </Col>

                <Col lg={5}>
                    <Card className="card-premium border-0 shadow-sm p-4 h-100" style={{ borderRadius: '24px' }}>
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <Layers size={20} className="text-primary" />
                            <h3 className="h5 fw-bold mb-0">Mix de Itens Orçados</h3>
                        </div>
                        <div style={{ height: '300px' }}>
                            <BarChart 
                                series={categoryMix.series}
                                categories={categoryMix.categories}
                                height={300}
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

export default TechnicalDashboardView;
