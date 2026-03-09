import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Spinner, InputGroup, Nav, Tab } from 'react-bootstrap';
import { Target, Plus, Edit, Trash2, Calendar, User as UserIcon, Save, AlertCircle, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale/pt-BR';
import { startOfMonth, isBefore, format, setMonth, setYear } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import { comercialApi } from '../api/comercial';
import { usuarioApi } from '../api/usuarios';
import { MetaMensal, User } from '../types';
import ConfirmModal from '../components/ConfirmModal';

registerLocale('pt-BR', ptBR);

const Metas: React.FC = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('global');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMeta, setSelectedMeta] = useState<Partial<MetaMensal> | null>(null);
    const [displayValue, setDisplayValue] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    const { data: metasData, isLoading } = useQuery<MetaMensal[]>({
        queryKey: ['metas'],
        queryFn: () => comercialApi.listMetas()
    });
    const metas = Array.isArray(metasData) ? metasData : [];

    const { data: vendedoresData } = useQuery<User[]>({
        queryKey: ['vendedores'],
        queryFn: () => usuarioApi.list({ role: 'COMERCIAL', page_size: 1000 })
    });
    const vendedores = Array.isArray(vendedoresData) ? vendedoresData : [];

    // Filtros de Metas
    const globalMetas = useMemo(() => metas.filter(m => !m.vendedor), [metas]);
    const userMetas = useMemo(() => metas.filter(m => !!m.vendedor), [metas]);

    const saveMutation = useMutation({
        mutationFn: (data: Partial<MetaMensal>) =>
            data.id ? comercialApi.updateMeta(data.id, data) : comercialApi.createMeta(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['metas'] });
            queryClient.invalidateQueries({ queryKey: ['analytics-finance'] });
            setShowModal(false);
            setSelectedMeta(null);
        },
        onError: (err: any) => {
            const errorMsg = err.response?.data?.non_field_errors?.[0] || 
                            err.response?.data?.detail || 
                            "Erro ao salvar meta. Verifique se já existe uma meta para este período.";
            alert(errorMsg);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => comercialApi.deleteMeta(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['metas'] });
            setShowDeleteModal(false);
            setSelectedMeta(null);
        }
    });

    const formatCurrency = (value: string | number) => {
        const amount = typeof value === 'string' ? parseFloat(value) : value;
        return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        const amount = Number(rawValue) / 100;
        setDisplayValue(amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
        setSelectedMeta((prev: any) => ({ ...prev, valor_meta: amount.toFixed(2) }));
    };

    const handleEdit = (meta: MetaMensal) => {
        setSelectedMeta(meta);
        setDisplayValue(formatCurrency(meta.valor_meta));
        setSelectedDate(new Date(meta.ano, meta.mes - 1));
        setShowModal(true);
    };

    const handleAddGoal = () => {
        const initialVendedor = activeTab === 'salesman' ? (vendedores[0]?.id || undefined) : undefined;
        setSelectedMeta({ 
            mes: new Date().getMonth() + 1, 
            ano: selectedYear, 
            vendedor: initialVendedor 
        });
        setSelectedDate(new Date(selectedYear, new Date().getMonth()));
        setDisplayValue('R$ 0,00');
        setShowModal(true);
    };

    const handleAddForMonth = (monthIndex: number) => {
        const date = setYear(setMonth(new Date(), monthIndex), selectedYear);
        setSelectedDate(date);
        setSelectedMeta({ mes: monthIndex + 1, ano: selectedYear, vendedor: undefined });
        setDisplayValue('R$ 0,00');
        setShowModal(true);
    };

    // Renderiza o Grid Anual
    const renderAnnualCalendar = () => {
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        return (
            <Row className="g-2">
                {months.map((monthName, idx) => {
                    const meta = globalMetas.find(m => m.mes === idx + 1 && m.ano === selectedYear);
                    const isPast = isBefore(new Date(selectedYear, idx), startOfMonth(new Date()));

                    return (
                        <Col key={idx} xs={6} md={4} lg={2}>
                            <Card className={`border-0 shadow-sm h-100 transition-hover ${isPast ? 'bg-light opacity-75' : 'bg-white'}`} 
                                  style={{ borderRadius: '16px', cursor: 'pointer' }}
                                  onClick={() => meta ? handleEdit(meta) : !isPast && handleAddForMonth(idx)}>
                                <Card.Body className="p-2 text-center">
                                    <div className="text-muted x-small fw-bold uppercase mb-1">{monthName}</div>
                                    
                                    {meta ? (
                                        <div className="py-1">
                                            <div className="fw-extrabold text-primary" style={{ fontSize: '0.9rem' }}>
                                                {parseFloat(meta.valor_meta).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-1">
                                            <span className="text-muted x-small italic">{isPast ? '---' : 'Definir'}</span>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        );
    };

    if (isLoading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <Container fluid className="px-1 pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4 pt-2">
                <div>
                    <h1 className="h4 fw-extrabold mb-1" style={{ color: '#2A3547', letterSpacing: '-0.5px' }}>Gestão de Metas</h1>
                    <p className="text-muted small mb-0 fw-medium">Planejamento financeiro global e individual.</p>
                </div>
                <Button
                    variant="primary"
                    className="shadow-premium rounded-pill px-4 fw-bold d-flex align-items-center"
                    onClick={handleAddGoal}
                >
                    <Plus size={18} className="me-2" /> NOVA META
                </Button>
            </div>

            <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'global')}>
                <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '20px' }}>
                    <Card.Header className="bg-white border-0 p-3">
                        <Nav variant="pills" className="nav-pills-premium">
                            <Nav.Item>
                                <Nav.Link eventKey="global" className="d-flex align-items-center gap-2">
                                    <TrendingUp size={18} /> Metas Globais
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="salesman" className="d-flex align-items-center gap-2">
                                    <UserIcon size={18} /> Metas por Vendedor
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Card.Header>
                </Card>

                <Tab.Content>
                    <Tab.Pane eventKey="global">
                        <div className="d-flex justify-content-between align-items-center mb-3 px-2">
                            <h5 className="fw-bold text-dark mb-0">Grade Anual - {selectedYear}</h5>
                            <div className="d-flex gap-2">
                                <Button variant="light" size="sm" className="rounded-circle" onClick={() => setSelectedYear(selectedYear - 1)}>
                                    <ChevronLeft size={18} />
                                </Button>
                                <Button variant="light" size="sm" className="rounded-circle" onClick={() => setSelectedYear(selectedYear + 1)}>
                                    <ChevronRight size={18} />
                                </Button>
                            </div>
                        </div>
                        {renderAnnualCalendar()}
                    </Tab.Pane>

                    <Tab.Pane eventKey="salesman">
                        <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '24px' }}>
                            <Card.Body className="p-0">
                                <Table responsive hover className="mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="ps-4 py-3 text-muted small fw-bold uppercase letter-spacing-1">PERÍODO</th>
                                            <th className="py-3 text-muted small fw-bold uppercase letter-spacing-1">VENDEDOR</th>
                                            <th className="py-3 text-end text-muted small fw-bold uppercase letter-spacing-1">OBJETIVO</th>
                                            <th className="py-3 text-center text-muted small fw-bold uppercase letter-spacing-1">AÇÕES</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userMetas.length > 0 ? userMetas.map(meta => {
                                            const isPast = isBefore(new Date(meta.ano, meta.mes - 1), startOfMonth(new Date()));
                                            return (
                                                <tr key={meta.id} className={`align-middle border-bottom border-light ${isPast ? 'opacity-75' : ''}`}>
                                                    <td className="ps-4 py-3">
                                                        <div className="d-flex align-items-center">
                                                            <div className={`p-2 rounded-12 me-3 ${isPast ? 'bg-secondary-subtle text-secondary' : 'bg-primary-subtle text-primary'}`}>
                                                                <Calendar size={18} />
                                                            </div>
                                                            <div style={{ lineHeight: '1.2' }}>
                                                                <div className="fw-bold mb-0 text-dark" style={{ fontSize: '0.95rem' }}>{meta.mes_nome}</div>
                                                                <div className="text-muted x-small fw-bold">ANO {meta.ano}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Badge bg="info" className="fw-medium px-3 py-2 rounded-pill d-flex align-items-center gap-1 w-fit">
                                                            <UserIcon size={12} /> {meta.vendedor_nome}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-end py-3 text-primary fw-bold" style={{ fontSize: '1.1rem' }}>
                                                        {formatCurrency(meta.valor_meta)}
                                                    </td>
                                                    <td className="text-center py-3">
                                                        <div className="d-flex justify-content-center gap-1">
                                                            <Button variant="light" className="btn-icon rounded-circle" onClick={() => handleEdit(meta)}>
                                                                <Edit size={16} className="text-primary" />
                                                            </Button>
                                                            <Button variant="light" className="btn-icon rounded-circle" onClick={() => { setSelectedMeta(meta); setShowDeleteModal(true); }}>
                                                                <Trash2 size={16} className="text-danger" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan={4} className="text-center py-5 text-muted">Nenhuma meta individual cadastrada.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>

            {/* Modal de Cadastro/Edição */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" className="modal-premium">
                <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
                    <Modal.Title className="fw-bold d-flex align-items-center">
                        <div className="bg-primary text-white p-2 rounded-12 me-3 shadow-sm" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Target size={20} />
                        </div>
                        <div style={{ fontFamily: 'Plus Jakarta Sans', letterSpacing: '-0.5px' }}>
                            {selectedMeta?.id ? 'Editar Objetivo' : 'Nova Meta Mensal'}
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(selectedMeta!); }}>
                        <Row className="g-4">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="form-premium-label">Selecione o Mês e Ano (MM/AAAA)</Form.Label>
                                    <div className="datepicker-modern-container shadow-inner rounded-12 border">
                                        <Calendar className="datepicker-icon text-primary" size={18} />
                                        <DatePicker
                                            selected={selectedDate}
                                            onChange={(date: Date | null) => {
                                                if (date) {
                                                    setSelectedDate(date);
                                                    setSelectedMeta({
                                                        ...selectedMeta,
                                                        mes: date.getMonth() + 1,
                                                        ano: date.getFullYear()
                                                    });
                                                }
                                            }}
                                            dateFormat="MMMM 'de' yyyy"
                                            showMonthYearPicker
                                            locale="pt-BR"
                                            className="form-control border-0 bg-transparent ps-5 py-2 shadow-none"
                                            placeholderText="Selecione MM/AAAA"
                                            required
                                        />
                                    </div>
                                </Form.Group>
                            </Col>

                            {activeTab === 'salesman' && (
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="form-premium-label">Vendedor Responsável</Form.Label>
                                        <InputGroup className="modern-input-group shadow-inner">
                                            <InputGroup.Text className="bg-white border-0 pe-0"><UserIcon size={18} className="text-primary" /></InputGroup.Text>
                                            <Form.Select
                                                className="border-0 ps-3 fw-medium text-dark shadow-none"
                                                value={selectedMeta?.vendedor || ''}
                                                onChange={(e) => setSelectedMeta({ ...selectedMeta, vendedor: e.target.value ? parseInt(e.target.value) : undefined })}
                                                required
                                            >
                                                <option value="" disabled>Escolha um vendedor...</option>
                                                {vendedores.map((v: User) => <option key={v.id} value={v.id}>{v.first_name} {v.last_name}</option>)}
                                            </Form.Select>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            )}

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="form-premium-label">Valor do Objetivo Financeiro</Form.Label>
                                    <InputGroup className="modern-input-group">
                                        <InputGroup.Text className="bg-primary-subtle border-0 text-primary fw-bold">R$</InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            className="form-control-premium ps-3 fw-bold text-primary shadow-none"
                                            style={{ fontSize: '1.25rem' }}
                                            placeholder="Ex: R$ 500.000,00"
                                            value={displayValue}
                                            onChange={handleValueChange}
                                            required
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-grid mt-5">
                            <Button variant="primary" type="submit" className="py-3 fw-bold rounded-16 shadow-premium d-flex align-items-center justify-content-center" disabled={saveMutation.isPending}>
                                {saveMutation.isPending ? <Spinner size="sm" className="me-2" /> : <Save className="me-2" size={20} />}
                                {selectedMeta?.id ? 'ATUALIZAR OBJETIVO' : 'ESTABELECER META'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <ConfirmModal
                show={showDeleteModal}
                title="Excluir Meta"
                message={`Deseja realmente excluir esta meta?`}
                onConfirm={() => selectedMeta?.id && deleteMutation.mutate(selectedMeta.id as number)}
                onCancel={() => setShowDeleteModal(false)}
                confirmLabel="Excluir"
                cancelLabel="Cancelar"
            />

            <style>{`
                .rounded-12 { border-radius: 12px !important; }
                .rounded-16 { border-radius: 16px !important; }
                .shadow-premium { box-shadow: 0 10px 30px rgba(93, 135, 255, 0.2) !important; }
                .w-fit { width: fit-content; }
                .letter-spacing-1 { letter-spacing: 1px; }
                .btn-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; padding: 0; border: 1px solid #f0f0f0; transition: 0.2s; }
                .btn-icon:hover { background-color: #5D87FF !important; border-color: #5D87FF !important; }
                .btn-icon:hover svg { color: #fff !important; }
                
                .nav-pills-premium { background: #F4F7FB; padding: 5px; border-radius: 14px; display: inline-flex; }
                .nav-pills-premium .nav-link { border-radius: 10px; color: #5A6A83; font-weight: 600; padding: 10px 20px; transition: 0.3s; }
                .nav-pills-premium .nav-link.active { background: #fff; color: #5D87FF; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
                
                .transition-hover { transition: transform 0.2s, box-shadow 0.2s; }
                .transition-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 25px rgba(0,0,0,0.08) !important; }
                
                .modal-premium .modal-content { border-radius: 32px; border: none; box-shadow: 0 30px 70px rgba(0,0,0,0.15); }
                .modern-input { border: 1px solid #DFE5EF !important; border-radius: 12px !important; padding: 12px 15px !important; }
                .modern-input-group { border: 1px solid #DFE5EF; border-radius: 12px; overflow: hidden; }
                .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05) !important; }
                
                .datepicker-modern-container { position: relative; width: 100%; background: #fff; display: flex; align-items: center; }
                .datepicker-modern-container .react-datepicker-wrapper { width: 100%; }
                .datepicker-icon { position: absolute; left: 15px; z-index: 10; pointer-events: none; }
                
                .react-datepicker { 
                    font-family: 'Plus Jakarta Sans', sans-serif; 
                    border-radius: 24px; 
                    border: none;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.1); 
                    padding: 15px;
                    width: 320px; /* Largura fixa para garantir a grade */
                }
                .react-datepicker__header { background-color: #fff; border-bottom: none; padding-top: 10px; }
                .react-datepicker__current-month { color: #2A3547; font-weight: 800; font-size: 1.1rem; margin-bottom: 15px; text-transform: capitalize; }
                
                .react-datepicker__month-container { width: 100%; }
                .react-datepicker__month { margin: 0; display: flex; flex-wrap: wrap; justify-content: space-between; }
                
                .react-datepicker__month-text { 
                    display: inline-flex !important;
                    align-items: center;
                    justify-content: center;
                    padding: 12px 0 !important; 
                    margin: 4px 1% !important; 
                    font-weight: 600; 
                    border-radius: 12px !important; 
                    transition: 0.2s; 
                    width: 31% !important; /* 3 colunas perfeitas */
                    color: #5A6A83;
                    font-size: 0.85rem;
                    text-transform: capitalize;
                }
                .react-datepicker__month-text--keyboard-selected, .react-datepicker__month-text--selected { 
                    background-color: #5D87FF !important; 
                    color: #fff !important; 
                    box-shadow: 0 8px 15px rgba(93, 135, 255, 0.25); 
                }
                .react-datepicker__month-text:hover:not(.react-datepicker__month-text--disabled) { 
                    background-color: #ECF2FF !important; 
                    color: #5D87FF !important; 
                }
                
                .react-datepicker__navigation { top: 18px; }
                .react-datepicker__navigation--previous { left: 10px; }
                .react-datepicker__navigation--next { right: 10px; }
            `}</style>
        </Container>
    );
};

export default Metas;
