import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Container, Row, Col, Card, Badge, Button, Spinner, Dropdown } from 'react-bootstrap';
import { Plus, MoreVertical, DollarSign, Calendar, User, Search, Briefcase, Building, Flag, ListTodo, Lock } from 'lucide-react';
import { comercialApi } from '../api/comercial';
import { clienteApi } from '../api/clientes';
import { Oportunidade, StatusOportunidade, Cliente } from '../types';
import { Modal, Form } from 'react-bootstrap';
import { maskCurrency, unmaskCurrency } from '../utils/masks';

const Kanban: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: statusList = [], isLoading: loadingStatus } = useQuery<StatusOportunidade[]>({
        queryKey: ['kanban-status'],
        queryFn: comercialApi.listStatus
    });

    const { data: oportunidades = [], isLoading: loadingOps } = useQuery<Oportunidade[]>({
        queryKey: ['kanban-ops'],
        queryFn: comercialApi.list
    });

    const { data: clientes = [] } = useQuery<Cliente[]>({
        queryKey: ['clientes'],
        queryFn: clienteApi.list
    });

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<Partial<Oportunidade>>({
        titulo: '',
        cliente: undefined,
        status: undefined,
        valor_estimado: '0.00',
        prioridade: 'MEDIA',
        fonte: 'SITE'
    });

    useEffect(() => {
        if (statusList.length > 0 && !formData.status) {
            setFormData(prev => ({ ...prev, status: statusList[0].id }));
        }
    }, [statusList, formData.status]);

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, statusId }: { id: number, statusId: number }) =>
            comercialApi.updateStatus(id, statusId),
        onMutate: async ({ id, statusId }) => {
            await queryClient.cancelQueries({ queryKey: ['kanban-ops'] });
            const previousOps = queryClient.getQueryData<Oportunidade[]>(['kanban-ops']);

            if (previousOps) {
                queryClient.setQueryData(['kanban-ops'], previousOps.map(op =>
                    op.id === id ? { ...op, status: statusId } : op
                ));
            }

            return { previousOps };
        },
        onError: (err, variables, context) => {
            if (context?.previousOps) {
                queryClient.setQueryData(['kanban-ops'], context.previousOps);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['kanban-ops'] });
        }
    });

    const createMutation = useMutation({
        mutationFn: (data: Partial<Oportunidade>) => comercialApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kanban-ops'] });
            setShowModal(false);
            setFormData({ titulo: '', valor_estimado: '0.00' });
        }
    });

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const opId = parseInt(draggableId);
        const newStatusId = parseInt(destination.droppableId);

        updateStatusMutation.mutate({ id: opId, statusId: newStatusId });
    };

    if (loadingStatus || loadingOps) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Pipeline de Vendas</h2>
                    <p className="text-muted small mb-0">Gerencie suas oportunidades comerciais e acompanhe o progresso.</p>
                </div>
                <Button variant="primary" className="d-flex align-items-center shadow-sm" onClick={() => setShowModal(true)}>
                    <Plus size={18} className="me-2" /> Nova Oportunidade
                </Button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="kanban-wrapper" style={{
                    display: 'flex',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    gap: '1.5rem',
                    paddingBottom: '1rem',
                    minHeight: 'calc(100vh - 120px)'
                }}>
                    {statusList.map((status: StatusOportunidade) => (
                        <div key={status.id} className="kanban-column" style={{ minWidth: '320px', maxWidth: '320px' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3 px-2">
                                <div className="d-flex align-items-center">
                                    <h6 className="fw-bold mb-0 me-2">{status.nome}</h6>
                                    <Badge pill bg="light" text="dark" className="border">
                                        {oportunidades.filter((o: Oportunidade) => o.status === status.id).length}
                                    </Badge>
                                </div>
                                <div style={{ width: '20px', height: '4px', backgroundColor: status.cor, borderRadius: '2px' }}></div>
                            </div>

                            <Droppable droppableId={status.id.toString()}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`kanban-droppable p-2 rounded-3 ${snapshot.isDraggingOver ? 'bg-light border shadow-inner' : 'bg-transparent'}`}
                                        style={{ minHeight: 'calc(100vh - 200px)', overflowY: 'auto', transition: 'background-color 0.2s ease' }}
                                    >
                                        {oportunidades
                                            .filter((o: Oportunidade) => o.status === status.id)
                                            .map((op: Oportunidade, index: number) => {
                                                const isLocked = op.status_detalhe?.notifica_setor_tecnico;
                                                return (
                                                    <Draggable
                                                        key={op.id}
                                                        draggableId={op.id.toString()}
                                                        index={index}
                                                        isDragDisabled={isLocked}
                                                    >
                                                        {(provided, snapshot) => (
                                                            <Card
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`mb-3 border-0 shadow-sm card-premium ${snapshot.isDragging ? 'shadow-lg rotate-1' : ''} ${isLocked ? 'locked-card' : ''}`}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    borderLeft: `4px solid ${status.cor} !important`
                                                                }}
                                                            >
                                                                <Card.Body className="p-3">
                                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                                        <div className="d-flex align-items-center">
                                                                            <span className="text-muted x-small fw-bold me-2">OP-{op.numero.toString().padStart(4, '0')}</span>
                                                                            {isLocked && <Lock size={12} className="text-warning" />}
                                                                        </div>
                                                                        <Dropdown align="end">
                                                                            <Dropdown.Toggle as="div" className="p-0 border-0 bg-transparent text-muted cursor-pointer">
                                                                                <MoreVertical size={14} />
                                                                            </Dropdown.Toggle>
                                                                            <Dropdown.Menu className="shadow border-0">
                                                                                <Dropdown.Item
                                                                                    className="small fw-bold text-primary"
                                                                                    onClick={() => navigate(`/novo-orcamento?oportunidade=${op.id}&cliente=${op.cliente}`)}
                                                                                >
                                                                                    Gerar Orçamento
                                                                                </Dropdown.Item>
                                                                                <Dropdown.Item className="small" onClick={() => window.open(`http://localhost:8000/comercial/api/oportunidade/${op.id}/pdf/`, '_blank')}>
                                                                                    Gerar Proposta PDF
                                                                                </Dropdown.Item>
                                                                                <Dropdown.Item className="small">Ver Detalhes</Dropdown.Item>
                                                                                <Dropdown.Item className="small">Editar</Dropdown.Item>
                                                                                <Dropdown.Divider />
                                                                                <Dropdown.Item className="small text-danger">Excluir</Dropdown.Item>
                                                                            </Dropdown.Menu>
                                                                        </Dropdown>
                                                                    </div>
                                                                    <h6 className="fw-bold mb-2 text-dark" style={{ fontSize: '0.9rem' }}>{op.titulo}</h6>
                                                                    <p className="small text-muted mb-3 line-clamp-2" style={{ fontSize: '0.8rem' }}>{op.descricao}</p>

                                                                    <div className="mb-3">
                                                                        <div className="d-flex align-items-center mb-1">
                                                                            <User size={12} className="text-primary me-2" />
                                                                            <span className="small fw-medium text-muted" style={{ fontSize: '0.75rem' }}>{op.cliente_detalhe?.razao_social || 'Cliente não definido'}</span>
                                                                        </div>
                                                                        <div className="d-flex align-items-center mb-1">
                                                                            <div className="bg-light rounded-circle p-1 me-2" style={{ fontSize: '10px' }}>👤</div>
                                                                            <span className="small text-muted" style={{ fontSize: '0.7rem' }}>{op.vendedor_nome || 'Sistema'}</span>
                                                                        </div>
                                                                        <div className="d-flex align-items-center">
                                                                            <DollarSign size={12} className="text-success me-2" />
                                                                            <span className="small fw-bold text-success" style={{ fontSize: '0.85rem' }}>R$ {parseFloat(op.valor_estimado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between align-items-center">
                                                                        <div className="d-flex align-items-center">
                                                                            <Calendar size={12} className="text-muted me-1" />
                                                                            <span className="x-small text-muted">
                                                                                {op.data_prevista_fechamento
                                                                                    ? new Date(op.data_prevista_fechamento).toLocaleDateString('pt-BR')
                                                                                    : op.criado_em
                                                                                        ? new Date(op.criado_em).toLocaleDateString('pt-BR')
                                                                                        : '--/--/--'}
                                                                            </span>
                                                                        </div>
                                                                        <Badge bg={op.prioridade === 'ALTA' ? 'danger' : op.prioridade === 'MEDIA' ? 'warning' : 'info'} className="x-small">
                                                                            {op.prioridade}
                                                                        </Badge>
                                                                    </div>
                                                                </Card.Body>
                                                            </Card>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered className="modal-premium">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Nova Oportunidade</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form className="g-3 row">
                        <Col md={12} className="mb-3">
                            <Form.Label className="form-premium-label">Título da Oportunidade</Form.Label>
                            <div className="input-icon-wrapper">
                                <Briefcase size={18} />
                                <Form.Control
                                    required
                                    className="form-control-premium"
                                    value={formData.titulo}
                                    onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                    placeholder="Ex: Projeto Residencial Alpha"
                                />
                            </div>
                        </Col>
                        <Col md={12} className="mb-3">
                            <Form.Label className="form-premium-label">Cliente</Form.Label>
                            <div className="input-icon-wrapper">
                                <Building size={18} />
                                <Form.Select
                                    required
                                    className="form-select-premium"
                                    value={formData.cliente}
                                    onChange={e => setFormData({ ...formData, cliente: parseInt(e.target.value) })}
                                >
                                    <option value="">Selecione o Cliente</option>
                                    {clientes.map((c: Cliente) => <option key={c.id} value={c.id}>{c.razao_social}</option>)}
                                </Form.Select>
                            </div>
                        </Col>
                        <Col md={6} className="mb-3">
                            <Form.Label className="form-premium-label">Valor Estimado (R$)</Form.Label>
                            <div className="input-icon-wrapper">
                                <DollarSign size={18} />
                                <Form.Control
                                    required
                                    className="form-control-premium"
                                    value={formData.valor_estimado ? maskCurrency(formData.valor_estimado) : ''}
                                    onChange={(e) => {
                                        const unmasked = unmaskCurrency(e.target.value);
                                        setFormData({ ...formData, valor_estimado: unmasked });
                                    }}
                                    placeholder="R$ 0,00"
                                />
                            </div>
                        </Col>
                        <Col md={6} className="mb-3">
                            <Form.Label className="form-premium-label">Prioridade</Form.Label>
                            <div className="input-icon-wrapper">
                                <Flag size={18} />
                                <Form.Select
                                    className="form-select-premium"
                                    value={formData.prioridade}
                                    onChange={e => setFormData({ ...formData, prioridade: e.target.value as any })}
                                >
                                    <option value="BAIXA">Baixa</option>
                                    <option value="MEDIA">Média</option>
                                    <option value="ALTA">Alta</option>
                                </Form.Select>
                            </div>
                        </Col>
                        <Col md={6} className="mb-3">
                            <Form.Label className="form-premium-label">Fonte</Form.Label>
                            <div className="input-icon-wrapper">
                                <Search size={18} />
                                <Form.Select
                                    className="form-select-premium"
                                    value={formData.fonte}
                                    onChange={e => setFormData({ ...formData, fonte: e.target.value as any })}
                                >
                                    <option value="INDICACAO">Indicação</option>
                                    <option value="SITE">Site</option>
                                    <option value="PROSPECCAO">Prospecção</option>
                                    <option value="WHATSAPP">WhatsApp</option>
                                    <option value="OUTRO">Outro</option>
                                </Form.Select>
                            </div>
                        </Col>
                        <Col md={12} className="mb-3">
                            <Form.Label className="form-premium-label">Status Inicial</Form.Label>
                            <div className="input-icon-wrapper">
                                <ListTodo size={18} />
                                <Form.Select
                                    className="form-select-premium"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: parseInt(e.target.value) })}
                                >
                                    {statusList.map((s: StatusOportunidade) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                                </Form.Select>
                            </div>
                        </Col>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-0 p-4 pt-0">
                    <Button variant="light" onClick={() => setShowModal(false)} className="btn-premium-secondary">Cancelar</Button>
                    <Button
                        className="btn-premium-primary"
                        onClick={() => createMutation.mutate(formData)}
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? 'Criando...' : 'Criar Oportunidade'}
                    </Button>
                </Modal.Footer>
            </Modal>
            <style>{`
                .kanban-wrapper::-webkit-scrollbar {
                    height: 8px;
                }
                .kanban-wrapper::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .kanban-wrapper::-webkit-scrollbar-thumb {
                    background: #ccc;
                    border-radius: 10px;
                }
                .x-small {
                    font-size: 0.7rem;
                }
                .rotate-1 {
                    transform: rotate(2deg);
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .locked-card {
                    background-color: #f8fafc !important;
                    cursor: default !important;
                    opacity: 0.85;
                }
            `}</style>
        </Container>
    );
};

export default Kanban;
