import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { orcamentoApi } from '../api/orcamentos';
import { Table, Button, Card, Badge, Spinner } from 'react-bootstrap';
import { Plus, Printer, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { data: orcamentos, isLoading, error } = useQuery({
        queryKey: ['orcamentos'],
        queryFn: orcamentoApi.list,
    });

    const getStatusBadge = (status) => {
        const variants = {
            RASCUNHO: 'secondary',
            ELABORACAO: 'primary',
            REVISAO: 'warning',
            APROVADO: 'success',
            REPROVADO: 'danger',
        };
        return <Badge bg={variants[status] || 'info'}>{status}</Badge>;
    };

    if (isLoading) return <Spinner animation="border" variant="primary" />;
    if (error) return <div className="alert alert-danger">Erro ao carregar orçamentos.</div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="h3 fw-bold">Seus Orçamentos</h2>
                <Button as={Link} to="/novo-orcamento" variant="primary" className="d-flex align-items-center">
                    <Plus size={18} className="me-2" /> Novo Orçamento
                </Button>
            </div>

            <Card className="card-premium">
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4">Número</th>
                                <th>Cliente</th>
                                <th>Status</th>
                                <th>Valor Total</th>
                                <th>Margem</th>
                                <th className="text-end pe-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orcamentos?.map((orc) => (
                                <tr key={orc.id}>
                                    <td className="ps-4 fw-medium">
                                        ORC-{orc.numero?.toString().padStart(4, '0')}-R{orc.revisao?.toString().padStart(2, '0')}
                                    </td>
                                    <td>{orc.cliente_detalhe?.razao_social || 'N/A'}</td>
                                    <td>{getStatusBadge(orc.status)}</td>
                                    <td>R$ {parseFloat(orc.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td>{(orc.margem_contrib * 100).toFixed(1)}%</td>
                                    <td className="text-end pe-4">
                                        <Button variant="link" size="sm" className="text-primary" as={Link} to={`/orcamento/${orc.id}`}>
                                            <Edit size={16} />
                                        </Button>
                                        <Button variant="link" size="sm" className="text-secondary" href={`/orcamentos/pdf/${orc.id}/`} target="_blank">
                                            <Printer size={16} />
                                        </Button>
                                        <Button variant="link" size="sm" className="text-danger">
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {orcamentos?.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        Nenhum orçamento encontrado. Comece criando um novo!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Dashboard;
