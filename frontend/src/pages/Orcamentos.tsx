import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Table, Button, Badge, Spinner, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { Plus, Search, Filter, Eye, Edit, Printer, Copy, Trash2, FileText, Activity, User } from 'lucide-react';
import { orcamentoApi } from '../api/orcamentos';
import { Orcamento } from '../types';
import ConfirmModal from '../components/ConfirmModal';

const Orcamentos: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);

    const { data: orcamentos = [], isLoading } = useQuery<Orcamento[]>({
        queryKey: ['orcamentos'],
        queryFn: orcamentoApi.list,
    });

    const revisionMutation = useMutation({
        mutationFn: (id: number) => orcamentoApi.createRevision(id),
        onSuccess: (newOrc) => {
            queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
            navigate(`/orcamento/${newOrc.id}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => orcamentoApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
            setShowDeleteModal(false);
            setSelectedOrcamento(null);
        },
    });

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            'RASCUNHO': 'secondary',
            'ELABORACAO': 'info',
            'REVISAO': 'warning',
            'ENVIADO': 'primary',
            'APROVADO': 'success',
            'REPROVADO': 'danger',
            'CANCELADO': 'dark',
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    const filteredOrcamentos = orcamentos.filter(orc => {
        const matchesSearch = orc.numero.toString().includes(searchTerm) ||
            orc.cliente_detalhe?.razao_social.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter ? orc.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    const handleDeleteClick = (orc: Orcamento) => {
        setSelectedOrcamento(orc);
        setShowDeleteModal(true);
    };

    if (isLoading) return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <Spinner animation="border" variant="primary" />
        </Container>
    );

    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h4 fw-extrabold mb-1" style={{ color: '#2A3547', letterSpacing: '-0.5px' }}>Gestão de Orçamentos</h1>
                    <p className="text-muted small mb-0">Acompanhe e edite as propostas técnicas enviadas pelo comercial através do Pipeline.</p>
                </div>
            </div>

            <Card className="card-premium border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                    <Row className="g-3 align-items-end">
                        <Col md={5}>
                            <Form.Label className="small fw-bold text-muted">Pesquisar Orçamento</Form.Label>
                            <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                                <InputGroup.Text className="bg-white border-0 ps-3">
                                    <Search size={18} className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                    className="border-0 shadow-none py-2"
                                    placeholder="Digite o número do orçamento ou nome do cliente..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <Form.Label className="small fw-bold text-muted">Filtrar por Status</Form.Label>
                            <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                                <InputGroup.Text className="bg-white border-0 ps-3">
                                    <Activity size={18} className="text-muted" />
                                </InputGroup.Text>
                                <Form.Select
                                    className="border-0 shadow-none py-2 ps-0"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">Todos os Status</option>
                                    <option value="RASCUNHO">Rascunho</option>
                                    <option value="ELABORACAO">Em Elaboração</option>
                                    <option value="REVISAO">Aguardando Revisão</option>
                                    <option value="ENVIADO">Enviado</option>
                                    <option value="APROVADO">Aprovado</option>
                                    <option value="REPROVADO">Reprovado</option>
                                </Form.Select>
                            </InputGroup>
                        </Col>
                        <Col md={4} className="text-end">
                            <Button variant="light" className="text-muted fw-bold" onClick={() => { setSearchTerm(''); setStatusFilter(''); }}>
                                Limpar Filtros
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="card-premium border-0 shadow-sm overflow-hidden">
                <Table responsive hover className="mb-0 table-modern">
                    <thead>
                        <tr>
                            <th className="ps-4">Nº Orçamento</th>
                            <th>Cliente</th>
                            <th>Vendedor</th>
                            <th>Status</th>
                            <th>Valor Total</th>
                            <th className="text-end pe-4">AÇÕES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrcamentos.length > 0 ? (
                            filteredOrcamentos.map((orc) => (
                                <tr key={orc.id} className="align-middle">
                                    <td className="ps-4">
                                        <div className="d-flex align-items-center">
                                            <div className="icon-box-small me-3 bg-light text-primary">
                                                <FileText size={16} />
                                            </div>
                                            <div>
                                                <div className="fw-bold text-dark">ORC-{orc.numero.toString().padStart(4, '0')}</div>
                                                <div className="text-muted x-small">Revisão R{orc.revisao.toString().padStart(2, '0')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="fw-medium text-dark">{orc.cliente_detalhe?.razao_social || 'N/A'}</div>
                                        <div className="text-muted x-small">{orc.cliente_detalhe?.cnpj || orc.cliente_detalhe?.cpf}</div>
                                    </td>
                                    <td>
                                        <div className="small text-muted d-flex align-items-center">
                                            <div className="bg-light rounded-circle p-1 me-2 d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                                                <User size={12} className="text-primary" />
                                            </div>
                                            <span className="fw-medium text-dark">{orc.vendedor_nome}</span>
                                        </div>
                                    </td>
                                    <td>{getStatusBadge(orc.status)}</td>
                                    <td className="fw-bold text-primary">
                                        R$ {parseFloat(orc.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="text-primary"
                                                title="Editar"
                                                onClick={() => navigate(`/orcamento/${orc.id}`)}
                                            >
                                                <Edit size={14} />
                                            </Button>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="text-secondary"
                                                title="Nova Revisão"
                                                onClick={() => revisionMutation.mutate(orc.id)}
                                                disabled={revisionMutation.isPending}
                                            >
                                                <Copy size={14} />
                                            </Button>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="text-info"
                                                title="Gerar PDF"
                                                onClick={() => window.open(`http://127.0.0.1:8000/orcamentos/pdf/${orc.id}/`, '_blank')}
                                            >
                                                <Printer size={14} />
                                            </Button>
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="text-danger"
                                                title="Excluir"
                                                onClick={() => handleDeleteClick(orc)}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-5 text-muted">
                                    Nenhum orçamento encontrado para os critérios de busca.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>

            <ConfirmModal 
                show={showDeleteModal}
                title="Excluir Orçamento"
                message={`Deseja realmente excluir o orçamento ORC-${selectedOrcamento?.numero.toString().padStart(4, '0')}? Esta ação removerá permanentemente todos os kits e itens vinculados.`}
                onConfirm={() => selectedOrcamento && deleteMutation.mutate(selectedOrcamento.id)}
                onCancel={() => setShowDeleteModal(false)}
                confirmLabel="Excluir"
                cancelLabel="Cancelar"
            />

            <style>{`
                .rounded-12 { border-radius: 12px !important; }
                .x-small { font-size: 0.75rem; }
                .table-modern th { 
                    font-size: 0.75rem; 
                    text-transform: uppercase; 
                    letter-spacing: 0.05em; 
                    background-color: #f8fafc;
                    border-top: none;
                }
                .icon-box-small {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                }
            `}</style>
        </Container>
    );
};

export default Orcamentos;
