import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Container, Row, Col, Card, Badge, Button, Spinner, Dropdown, InputGroup, Alert } from 'react-bootstrap';
import { 
    Plus, MoreVertical, DollarSign, Calendar, User, Search, 
    Briefcase, Building, Flag, ListTodo, Lock, Paperclip, 
    AlertCircle, MessageSquare
} from 'lucide-react';
import { comercialApi } from '../api/comercial';
import { clienteApi } from '../api/clientes';
import { useAuth } from '../contexts/AuthContext';
import { Oportunidade, StatusOportunidade, Cliente } from '../types';
import { Modal, Form } from 'react-bootstrap';
import { maskCurrency, unmaskCurrency } from '../utils/masks';
import OpportunityFileManager from '../components/OpportunityFileManager';

const LOSS_REASONS = [
    { value: 'PRECO', label: 'Preço Elevado' },
    { value: 'PRAZO', label: 'Prazo de Entrega' },
    { value: 'TECNICO', label: 'Especificação Técnica' },
    { value: 'CONCORRENCIA', label: 'Perdeu para Concorrência' },
    { value: 'CANCELADO', label: 'Projeto Cancelado pelo Cliente' },
    { value: 'OUTRO', label: 'Outro Motivo' },
];

const Kanban: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuth();

    // Estados para o Gerenciador de Arquivos
    const [fileManagerShow, setFileManagerShow] = useState(false);
    const [selectedOpForFiles, setSelectedOpForFiles] = useState<{id: number, titulo: string} | null>(null);

    // Estados para Validação de Perda
    const [showLossModal, setShowLossModal] = useState(false);
    const [lossData, setLossData] = useState({ opId: 0, statusId: 0, motivo: '', detalhes: '' });

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
        mutationFn: ({ id, statusId, extraData }: { id: number, statusId: number, extraData?: any }) =>
            comercialApi.update(id, { status: statusId, ...extraData }),
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
        onSuccess: (newOp) => {
            queryClient.invalidateQueries({ queryKey: ['kanban-ops'] });
            setShowModal(false);
            setFormData({ titulo: '', valor_estimado: '0.00', prioridade: 'MEDIA', fonte: 'SITE' });
            
            setSelectedOpForFiles({ id: newOp.id, titulo: newOp.titulo });
            setFileManagerShow(true);
        }
    });

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const opId = parseInt(draggableId);
        const newStatusId = parseInt(destination.droppableId);
        
        // Verifica se o destino é o status "Perdido"
        const targetStatus = statusList.find(s => s.id === newStatusId);
        const isLost = targetStatus?.nome.toLowerCase().includes('perdido') || targetStatus?.id === 6;

        if (isLost) {
            // Intercepta e abre o modal de validação
            setLossData({ opId, statusId: newStatusId, motivo: '', detalhes: '' });
            setShowLossModal(true);
        } else {
            // Movimentação normal
            updateStatusMutation.mutate({ id: opId, statusId: newStatusId });
        }
    };

    const handleConfirmLoss = () => {
        if (!lossData.motivo) {
            alert("Por favor, selecione o motivo da perda.");
            return;
        }
        
        updateStatusMutation.mutate({ 
            id: lossData.opId, 
            statusId: lossData.statusId,
            extraData: {
                motivo_perda: lossData.motivo,
                detalhes_perda: lossData.detalhes
            }
        });
        setShowLossModal(false);
    };

    if (loadingStatus || loadingOps) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    return (
        <Container fluid className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h4 fw-extrabold mb-1" style={{ color: '#2A3547', letterSpacing: '-0.5px' }}>Pipeline de Vendas</h1>
                    <p className="text-muted small mb-0">Gerencie suas oportunidades comerciais e acompanhe o progresso.</p>
                </div>
                <Button variant="primary" className="d-flex align-items-center shadow-sm px-4 fw-bold rounded-12" onClick={() => setShowModal(true)}>
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

                                                let vendedorNome = "Vendedor";
                                                if (op.vendedor_nome && op.vendedor_nome.trim() !== "") {
                                                    vendedorNome = op.vendedor_nome;
                                                } else if (currentUser) {
                                                    vendedorNome = `${currentUser.first_name} ${currentUser.last_name}`.trim() || currentUser.username;
                                                }

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
                                                                            <span className="text-muted x-small fw-bold me-2">OP-{op.numero?.toString().padStart(4, '0') || '0000'}</span>
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
                                                                                <Dropdown.Item
                                                                                    className="small d-flex align-items-center gap-2"
                                                                                    onClick={() => {
                                                                                        setSelectedOpForFiles({ id: op.id, titulo: op.titulo });
                                                                                        setFileManagerShow(true);
                                                                                    }}
                                                                                >
                                                                                    <Paperclip size={14} /> Arquivos ({op.total_arquivos || 0})
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

                                                                    <div className="mb-3">
                                                                        <div className="d-flex align-items-center mb-2">
                                                                            <User size={14} className="text-primary me-2" />
                                                                            <span className="small fw-bold" style={{ fontSize: '0.8rem', color: '#5A6A83' }}>
                                                                                {op.cliente_detalhe?.nome_fantasia || op.cliente_detalhe?.razao_social || 'Cliente'}
                                                                            </span>
                                                                        </div>

                                                                        <div className="d-flex align-items-center mb-2">
                                                                            <div style={{
                                                                                width: '20px', height: '20px', borderRadius: '50%',
                                                                                backgroundColor: '#5D87FF', display: 'flex',
                                                                                alignItems: 'center', justifyContent: 'center',
                                                                                marginRight: '8px'
                                                                            }}>
                                                                                <User size={12} color="white" />
                                                                            </div>
                                                                            <span className="small fw-medium" style={{ fontSize: '0.8rem', color: '#2A3547' }}>
                                                                                {vendedorNome}
                                                                            </span>
                                                                        </div>

                                                                        <div className="d-flex align-items-center mb-2">
                                                                            <DollarSign size={14} className="text-success me-2" />
                                                                            <span className="small fw-bold text-success" style={{ fontSize: '0.9rem' }}>
                                                                                R$ {parseFloat(op.valor_estimado || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                                                                        <div className="d-flex align-items-center">
                                                                            <Calendar size={12} className="text-muted me-1" />
                                                                            <span className="x-small text-muted fw-bold">
                                                                                {op.criado_em ? new Date(op.criado_em).toLocaleDateString('pt-BR') : '--/--/--'}
                                                                            </span>
                                                                        </div>
                                                                        <Badge bg={op.prioridade === 'ALTA' ? 'danger' : op.prioridade === 'MEDIA' ? 'warning' : 'info'} className="x-small rounded-pill px-2">
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

            {/* Modal de Nova Oportunidade */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" className="modal-premium">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Nova Oportunidade</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form className="g-3 row">
                        <Col md={12} className="mb-3">
                            <Form.Label className="form-premium-label">Título da Oportunidade</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0"><Briefcase size={18} className="text-muted" /></InputGroup.Text>
                                <Form.Control
                                    required
                                    className="form-control-premium border-start-0"
                                    value={formData.titulo}
                                    onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                    placeholder="Ex: Projeto Residencial Alpha"
                                />
                            </InputGroup>
                        </Col>
                        <Col md={12} className="mb-3">
                            <Form.Label className="form-premium-label">Cliente</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0"><Building size={18} className="text-muted" /></InputGroup.Text>
                                <Form.Select
                                    required
                                    className="form-select-premium border-start-0"
                                    value={formData.cliente}
                                    onChange={e => setFormData({ ...formData, cliente: parseInt(e.target.value) })}
                                >
                                    <option value="">Selecione o Cliente</option>
                                    {clientes.map((c: Cliente) => <option key={c.id} value={c.id}>{c.razao_social}</option>)}
                                </Form.Select>
                            </InputGroup>
                        </Col>
                        <Col md={6} className="mb-3">
                            <Form.Label className="form-premium-label">Valor Estimado (R$)</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0"><DollarSign size={18} className="text-muted" /></InputGroup.Text>
                                <Form.Control
                                    required
                                    className="form-control-premium border-start-0"
                                    value={formData.valor_estimado ? maskCurrency(formData.valor_estimado) : ''}
                                    onChange={(e) => {
                                        const unmasked = unmaskCurrency(e.target.value);
                                        setFormData({ ...formData, valor_estimado: unmasked });
                                    }}
                                    placeholder="R$ 0,00"
                                />
                            </InputGroup>
                        </Col>
                        <Col md={6} className="mb-3">
                            <Form.Label className="form-premium-label">Prioridade</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0"><Flag size={18} className="text-muted" /></InputGroup.Text>
                                <Form.Select
                                    className="form-select-premium border-start-0"
                                    value={formData.prioridade}
                                    onChange={e => setFormData({ ...formData, prioridade: e.target.value as any })}
                                >
                                    <option value="BAIXA">Baixa</option>
                                    <option value="MEDIA">Média</option>
                                    <option value="ALTA">Alta</option>
                                </Form.Select>
                            </InputGroup>
                        </Col>
                        <Col md={6} className="mb-3">
                            <Form.Label className="form-premium-label">Fonte de Prospecção</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0"><Search size={18} className="text-muted" /></InputGroup.Text>
                                <Form.Select
                                    className="form-select-premium border-start-0"
                                    value={formData.fonte}
                                    onChange={e => setFormData({ ...formData, fonte: e.target.value as any })}
                                >
                                    <option value="INDICACAO">Indicação</option>
                                    <option value="SITE">Site</option>
                                    <option value="PROSPECCAO">Prospecção</option>
                                    <option value="WHATSAPP">WhatsApp</option>
                                    <option value="OUTRO">Outro</option>
                                </Form.Select>
                            </InputGroup>
                        </Col>
                        <Col md={12} className="mb-3">
                            <Form.Label className="form-premium-label">Status Inicial</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0"><ListTodo size={18} className="text-muted" /></InputGroup.Text>
                                <Form.Select
                                    className="form-select-premium border-start-0"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: parseInt(e.target.value) })}
                                >
                                    {statusList.map((s: StatusOportunidade) => <option key={s.id} value={s.id}>{s.nome}</option>)}
                                </Form.Select>
                            </InputGroup>
                        </Col>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-0 p-4 pt-0">
                    <Button variant="link" onClick={() => setShowModal(false)} className="text-muted text-decoration-none">Cancelar</Button>
                    <Button
                        variant="primary"
                        className="px-4 fw-bold rounded-pill shadow-sm"
                        onClick={() => createMutation.mutate(formData)}
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? 'Criando...' : 'Criar Oportunidade'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de Validação de Perda */}
            <Modal show={showLossModal} onHide={() => setShowLossModal(false)} centered className="modal-premium">
                <Modal.Header closeButton className="border-0 px-4 pt-4">
                    <Modal.Title className="fw-bold d-flex align-items-center text-danger">
                        <AlertCircle size={24} className="me-2" /> Validar Perda de Negócio
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 pb-4">
                    <Alert variant="danger" className="border-0 rounded-12 small fw-medium mb-4">
                        Para mover este card para "Perdido", é obrigatório registrar o motivo técnico ou comercial da perda.
                    </Alert>
                    
                    <Form.Group className="mb-3">
                        <Form.Label className="form-premium-label">Motivo da Perda</Form.Label>
                        <InputGroup className="rounded-12 overflow-hidden border">
                            <InputGroup.Text className="bg-light border-0"><Flag size={18} className="text-muted" /></InputGroup.Text>
                            <Form.Select 
                                className="border-0 shadow-none py-2"
                                value={lossData.motivo}
                                onChange={e => setLossData({ ...lossData, motivo: e.target.value })}
                                required
                            >
                                <option value="">Selecione o motivo...</option>
                                {LOSS_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </Form.Select>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label className="form-premium-label">Detalhes Adicionais</Form.Label>
                        <InputGroup className="rounded-12 overflow-hidden border">
                            <InputGroup.Text className="bg-light border-0 align-items-start pt-2"><MessageSquare size={18} className="text-muted" /></InputGroup.Text>
                            <Form.Control 
                                as="textarea" 
                                rows={3}
                                className="border-0 shadow-none py-2"
                                placeholder="Descreva os detalhes da negociação ou por que o cliente declinou..."
                                value={lossData.detalhes}
                                onChange={e => setLossData({ ...lossData, detalhes: e.target.value })}
                                required
                            />
                        </InputGroup>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0 px-4 pb-4 pt-0">
                    <Button variant="light" className="rounded-pill px-4 fw-bold" onClick={() => setShowLossModal(false)}>Cancelar</Button>
                    <Button 
                        variant="danger" 
                        className="rounded-pill px-4 fw-bold shadow-sm"
                        onClick={handleConfirmLoss}
                        disabled={!lossData.motivo || !lossData.detalhes}
                    >
                        Confirmar Perda
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Gerenciador de Arquivos */}
            {selectedOpForFiles && (
                <OpportunityFileManager 
                    show={fileManagerShow}
                    onHide={() => {
                        setFileManagerShow(false);
                        setSelectedOpForFiles(null);
                        queryClient.invalidateQueries({ queryKey: ['kanban-ops'] });
                    }}
                    oportunidadeId={selectedOpForFiles.id}
                    oportunidadeTitulo={selectedOpForFiles.titulo}
                />
            )}

            <style>{`
                .rounded-12 { border-radius: 12px !important; }
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
