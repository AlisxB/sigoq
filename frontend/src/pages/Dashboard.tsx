import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { orcamentoApi } from '../api/orcamentos';
import { Table, Button, Card, Row, Col, Spinner } from 'react-bootstrap';
import {
    Plus, Printer, Edit, Trash2, TrendingUp, DollarSign,
    FileCheck, UserCheck, ShoppingBag, PieChart, MoreHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Orcamento, OrcamentoStatus } from '../types';

const StatCard: React.FC<{ title: string, value: string, change: string, icon: React.ReactNode, bgColor: string, txtColor?: string }> = ({ title, value, change, icon, bgColor, txtColor = '#FFFFFF' }) => (
    <Card className="h-100 border-0 overflow-hidden shadow-none" style={{ backgroundColor: bgColor, borderRadius: '24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-15px', right: '-15px', opacity: 0.1 }}>
            <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="50" fill="white" />
            </svg>
        </div>
        <Card.Body className="p-4 d-flex flex-column justify-content-between position-relative" style={{ zIndex: 1 }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                {icon}
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
    const { data: orcamentos, isLoading } = useQuery<Orcamento[]>({
        queryKey: ['orcamentos'],
        queryFn: orcamentoApi.list,
    });

    const getStatusBadge = (status: OrcamentoStatus) => {
        const variants: Record<OrcamentoStatus, { bg: string, color: string }> = {
            RASCUNHO: { bg: 'rgba(90, 106, 131, 0.1)', color: '#5A6A83' },
            ELABORACAO: { bg: 'rgba(93, 135, 255, 0.1)', color: '#5D87FF' },
            REVISAO: { bg: 'rgba(255, 174, 31, 0.1)', color: '#FFAE1F' },
            ENVIADO: { bg: 'rgba(93, 135, 255, 0.05)', color: '#5D87FF' },
            APROVADO: { bg: 'rgba(19, 222, 185, 0.1)', color: '#13DEB9' },
            REPROVADO: { bg: 'rgba(250, 137, 107, 0.1)', color: '#FA896B' },
            CANCELADO: { bg: 'rgba(124, 143, 172, 0.1)', color: '#7C8FAC' },
        };
        const style = variants[status] || variants.ENVIADO;
        return (
            <span style={{
                backgroundColor: style.bg,
                color: style.color,
                padding: '5px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700'
            }}>
                {status}
            </span>
        );
    };

    if (isLoading) return <div className="d-flex justify-content-center py-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <div style={{ padding: '0 5px' }}>
            {/* Header / Stats Row */}
            <Row className="mb-4 g-4 overflow-hidden">
                {/* Welcome Card - Traduzido */}
                <Col md={5} lg={5}>
                    <Card className="h-100 border-1 shadow-sm" style={{ backgroundColor: '#FFFFFF', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <Card.Body className="p-4 d-flex align-items-center">
                            <div className="flex-grow-1">
                                <h2 className="h4 fw-bold mb-1" style={{ color: '#2A3547' }}>Bem-vindo de volta, Alison!</h2>
                                <p className="text-muted small mb-4">Veja o desempenho das propostas hoje.</p>
                                <Button className="px-4 py-2 fw-bold" style={{ backgroundColor: '#5D87FF', border: 'none', borderRadius: '10px', boxShadow: '0 4px 10px rgba(93,135,255,0.3)' }}>Ver Orçamentos</Button>
                            </div>
                            <div className="d-none d-lg-block">
                                <img src="https://spike-angular-pro-main.netlify.app/assets/images/backgrounds/welcome-bg.png"
                                    alt="Welcome"
                                    style={{ height: '140px', objectFit: 'contain' }}
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Stat Cards - Mais Sólidos */}
                <Col md={2} lg={2}>
                    <StatCard title="Total Vendas" value="2,358" change="+12.5%" icon={<ShoppingBag size={22} color="white" />} bgColor="#5D87FF" />
                </Col>
                <Col md={2} lg={2}>
                    <StatCard title="Orçamentos" value="356" change="+8.5%" icon={<FileCheck size={22} color="white" />} bgColor="#49BEFF" />
                </Col>
                <Col md={3} lg={3}>
                    <StatCard title="Meta Mensal" value="89%" change="+3%" icon={<TrendingUp size={22} color="white" />} bgColor="#2A3547" />
                </Col>
            </Row>

            {/* Charts Section */}
            <Row className="g-4 mb-4">
                <Col lg={7}>
                    <Card className="border-0 shadow-sm p-4 h-100" style={{ borderRadius: '24px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h3 className="h5 fw-bold mb-1">Lucros e Despesas</h3>
                                <p className="text-muted small mb-0">Comparativo mensal de desempenho</p>
                            </div>
                            <Button variant="link" className="p-0 text-muted"><MoreHorizontal size={20} /></Button>
                        </div>
                        {/* Placeholder Gráfico Barras */}
                        <div className="flex-grow-1 d-flex align-items-end justify-content-between mt-4" style={{ height: '280px', padding: '0 20px' }}>
                            {[45, 65, 50, 90, 60, 75, 70, 85].map((h, i) => (
                                <div key={i} className="d-flex flex-column align-items-center gap-2" style={{ width: '10%' }}>
                                    <div style={{ height: h * 2.2, width: '100%', backgroundColor: '#5D87FF', borderRadius: '10px', boxShadow: '0 4px 6px rgba(93,135,255,0.2)' }}></div>
                                    <div style={{ height: h * 1.2, width: '100%', backgroundColor: '#FA896B', borderRadius: '10px', boxShadow: '0 4px 6px rgba(250,137,107,0.2)' }}></div>
                                    <span className="text-muted fw-bold" style={{ fontSize: '10px' }}>Set</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>

                <Col lg={5}>
                    <Card className="border-0 shadow-sm p-4 h-100" style={{ borderRadius: '24px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="h5 fw-bold mb-0">Venda de Produtos</h3>
                            <Button variant="link" className="p-0 text-muted"><MoreHorizontal size={20} /></Button>
                        </div>
                        {/* Placeholder Gráfico Linha */}
                        <div className="flex-grow-1 position-relative d-flex align-items-center justify-content-center" style={{ height: '180px' }}>
                            <svg width="100%" height="150" viewBox="0 0 400 150" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#5D87FF" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#5D87FF" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d="M 0 100 Q 50 70, 100 80 T 200 60 T 300 90 T 400 30" fill="none" stroke="#5D87FF" strokeWidth="4" />
                                <path d="M 0 100 Q 50 70, 100 80 T 200 60 T 300 90 T 400 30 V 150 H 0 Z" fill="url(#lineGrad)" />
                            </svg>
                        </div>

                        <div className="mt-4 pt-4 border-top">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h3 className="h3 fw-bold mb-1">36,436</h3>
                                    <p className="text-muted small mb-0">Novas Propostas <span className="text-success fw-bold">+23%</span></p>
                                </div>
                                <div style={{ backgroundColor: 'rgba(93, 135, 255, 0.1)', padding: '12px', borderRadius: '15px' }}>
                                    <UserCheck size={24} color="#5D87FF" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* List Section */}
            <Card className="border-0 shadow-sm" style={{ borderRadius: '24px', padding: '30px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="h5 fw-bold mb-0" style={{ color: '#2A3547' }}>Orçamentos Recentes</h3>
                    <MoreHorizontal size={20} color="#7C8FAC" style={{ cursor: 'pointer' }} />
                </div>
                <Table responsive hover className="mb-0 overflow-hidden" style={{ borderCollapse: 'separate', borderSpacing: '0 0' }}>
                    <thead>
                        <tr style={{ color: '#7C8FAC', fontSize: '14px', borderBottom: '1px solid #F1F3F4' }}>
                            <th className="border-0 ps-0 pb-3" style={{ fontWeight: '500' }}>Cliente/Proposta</th>
                            <th className="border-0 pb-3" style={{ fontWeight: '500' }}>Valor Total</th>
                            <th className="border-0 pb-3" style={{ fontWeight: '500' }}>Margem</th>
                            <th className="border-0 pb-3 text-center" style={{ fontWeight: '500' }}>Status</th>
                            <th className="border-0 text-end pe-0 pb-3" style={{ fontWeight: '500' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orcamentos?.slice(0, 5).map((orc: Orcamento) => (
                            <tr key={orc.id} style={{ verticalAlign: 'middle' }}>
                                <td className="py-3 border-0 ps-0">
                                    <div className="d-flex align-items-center gap-3">
                                        <div style={{
                                            width: '45px',
                                            height: '45px',
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(93, 135, 255, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#5D87FF',
                                            fontWeight: 'bold',
                                            flexShrink: 0
                                        }}>
                                            {orc.cliente_detalhe?.razao_social?.charAt(0) || 'C'}
                                        </div>
                                        <div>
                                            <div className="fw-bold" style={{ color: '#2A3547', fontSize: '15px' }}>
                                                {orc.cliente_detalhe?.razao_social || 'N/A'}
                                            </div>
                                            <div className="text-muted" style={{ fontSize: '13px' }}>
                                                ORC-{orc.numero?.toString().padStart(4, '0')} · Rev {orc.revisao}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="border-0">
                                    <span className="fw-bold" style={{ color: '#2A3547', fontSize: '15px' }}>
                                        R$ {parseFloat(orc.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </span>
                                    <span style={{ color: '#7C8FAC', fontSize: '13px' }}>,00</span>
                                </td>
                                <td className="border-0">
                                    <span style={{ color: '#2A3547', fontSize: '15px', fontWeight: '500' }}>
                                        {(parseFloat(orc.margem_contrib) * 100).toFixed(0)}%
                                    </span>
                                    <span style={{ color: '#7C8FAC', fontSize: '14px' }}> margem</span>
                                </td>
                                <td className="border-0 text-center">
                                    {getStatusBadge(orc.status)}
                                </td>
                                <td className="border-0 text-end pe-0">
                                    <div className="d-flex justify-content-end gap-1">
                                        <Button variant="link" size="sm" className="p-1 text-muted" as={Link as any} to={`/orcamento/${orc.id}`}>
                                            <Edit size={18} />
                                        </Button>
                                        <Button variant="link" size="sm" className="p-1 text-muted">
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
};

export default Dashboard;
