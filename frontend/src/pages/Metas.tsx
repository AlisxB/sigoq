import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Spinner, InputGroup } from 'react-bootstrap';
import { Target, Plus, Edit, Trash2, Calendar, User as UserIcon, Save, AlertCircle } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale/pt-BR';
import { startOfMonth, isBefore } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import { comercialApi } from '../api/comercial';
import { usuarioApi } from '../api/usuarios';
import { MetaMensal, User } from '../types';
import ConfirmModal from '../components/ConfirmModal';

registerLocale('pt-BR', ptBR);

const Metas: React.FC = () => {
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMeta, setSelectedMeta] = useState<Partial<MetaMensal> | null>(null);
    const [displayValue, setDisplayValue] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    const { data: metas, isLoading } = useQuery({
        queryKey: ['metas'],
        queryFn: comercialApi.listMetas
    });

    const { data: vendedores = [] } = useQuery({
        queryKey: ['vendedores'],
        queryFn: () => usuarioApi.list({ role: 'COMERCIAL' })
    });

    const saveMutation = useMutation({
        mutationFn: (data: Partial<MetaMensal>) =>
            data.id ? comercialApi.updateMeta(data.id, data) : comercialApi.createMeta(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['metas'] });
            queryClient.invalidateQueries({ queryKey: ['analytics-finance'] });
            setShowModal(false);
            setSelectedMeta(null);
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

    const formatCurrency = (value: string) => {
        const numericValue = value.replace(/\D/g, '');
        if (!numericValue) return 'R$ 0,00';
        const amount = Number(numericValue) / 100;
        return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        setDisplayValue(formatCurrency(rawValue));
        const decimalValue = (Number(rawValue) / 100).toString();
        setSelectedMeta((prev: any) => ({ ...prev, valor_meta: decimalValue }));
    };

    const handleEdit = (meta: MetaMensal) => {
        const metaDate = new Date(meta.ano, meta.mes - 1);
        const today = startOfMonth(new Date());

        if (isBefore(metaDate, today)) {
            alert("Não é permitido editar metas de meses que já passaram.");
            return;
        }

        setSelectedMeta(meta);
        setDisplayValue(formatCurrency((parseFloat(meta.valor_meta) * 100).toFixed(0)));
        setSelectedDate(new Date(meta.ano, meta.mes - 1));
        setShowModal(true);
    };

    const handleDeleteClick = (meta: MetaMensal) => {
        const metaDate = new Date(meta.ano, meta.mes - 1);
        const today = startOfMonth(new Date());

        if (isBefore(metaDate, today)) {
            alert("Não é permitido excluir metas de meses passados para manter o histórico íntegro.");
            return;
        }

        setSelectedMeta(meta);
        setShowDeleteModal(true);
    };

    if (isLoading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <Container fluid className="px-1 pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4 pt-2">
                <div>
                    <h1 className="h4 fw-extrabold mb-1" style={{ color: '#2A3547', letterSpacing: '-0.5px' }}>Objetivos Comerciais</h1>
                    <p className="text-muted small mb-0 fw-medium">Defina metas para impulsionar o faturamento.</p>
                </div>
                <Button
                    variant="primary"
                    className="shadow-premium rounded-pill px-4 fw-bold d-flex align-items-center"
                    onClick={() => {
                        setSelectedMeta({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear() });
                        setSelectedDate(new Date());
                        setDisplayValue('R$ 0,00');
                        setShowModal(true);
                    }}
                >
                    <Plus size={18} className="me-2" /> NOVA META
                </Button>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '24px' }}>
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 py-3 text-muted small fw-bold uppercase letter-spacing-1">PERÍODO</th>
                                <th className="py-3 text-muted small fw-bold uppercase letter-spacing-1">RESPONSÁVEL</th>
                                <th className="py-3 text-end text-muted small fw-bold uppercase letter-spacing-1">VALOR OBJETIVO</th>
                                <th className="py-3 text-center text-muted small fw-bold uppercase letter-spacing-1">AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {metas && metas.length > 0 ? metas.map(meta => {
                                const isPast = isBefore(new Date(meta.ano, meta.mes - 1), startOfMonth(new Date()));
                                return (
                                    <tr key={meta.id} className={`align-middle border-bottom border-light ${isPast ? 'opacity-75' : ''}`}>
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center">
                                                <div className={`p-2 rounded-12 me-3 ${isPast ? 'bg-secondary-subtle text-secondary' : 'bg-primary-subtle text-primary'}`}>
                                                    <Calendar size={18} />
                                                </div>
                                                <div style={{ lineHeight: '1.2' }}>
                                                    <div className={`fw-bold mb-0 ${isPast ? 'text-muted' : 'text-dark'}`} style={{ fontSize: '0.95rem' }}>{meta.mes_nome}</div>
                                                    <div className="text-muted x-small fw-bold">ANO {meta.ano} {isPast && <span className="ms-1 text-uppercase text-secondary">(Encerrado)</span>}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {meta.vendedor ? (
                                                <Badge bg="info" className="fw-medium px-3 py-2 rounded-pill d-flex align-items-center gap-1 w-fit">
                                                    <UserIcon size={12} /> {meta.vendedor_nome}
                                                </Badge>
                                            ) : (
                                                <Badge bg="dark" className="fw-medium px-3 py-2 rounded-pill w-fit">GERAL (EMPRESA)</Badge>
                                            )}
                                        </td>
                                        <td className="text-end py-3">
                                            <div className={`fw-bold mb-0 ${isPast ? 'text-muted' : 'text-primary'}`} style={{ fontSize: '1.1rem' }}>
                                                R$ {parseFloat(meta.valor_meta).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="text-center py-3">
                                            <div className="d-flex justify-content-center gap-1">
                                                {!isPast && (
                                                    <>
                                                        <Button variant="light" className="btn-icon rounded-circle" onClick={() => handleEdit(meta)}>
                                                            <Edit size={16} className="text-primary" />
                                                        </Button>
                                                        <Button variant="light" className="btn-icon rounded-circle" onClick={() => handleDeleteClick(meta)}>
                                                            <Trash2 size={16} className="text-danger" />
                                                        </Button>
                                                    </>
                                                )}
                                                {isPast && <Badge bg="light" text="dark" className="border">Histórico</Badge>}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-5">
                                        <div className="py-4">
                                            <Target size={48} className="text-muted opacity-20 mb-3" />
                                            <p className="text-muted fw-medium">Nenhuma meta configurada para o período.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

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
                                    <div className="datepicker-modern-container">
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
                                            dateFormat="MM/yyyy"
                                            showMonthYearPicker
                                            locale="pt-BR"
                                            minDate={startOfMonth(new Date())}
                                            className="form-control modern-input"
                                            placeholderText="Selecione MM/AAAA"
                                            required
                                        />
                                        <Calendar className="datepicker-icon text-primary" size={18} />
                                    </div>
                                    <div className="mt-2 d-flex align-items-center gap-1 text-muted x-small">
                                        <AlertCircle size={12} /> Somente metas atuais ou futuras podem ser alteradas.
                                    </div>
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="form-premium-label">Responsável pela Meta</Form.Label>
                                    <InputGroup className="modern-input-group">
                                        <InputGroup.Text className="bg-white border-0"><UserIcon size={18} className="text-primary" /></InputGroup.Text>
                                        <Form.Select
                                            className="border-0 ps-0 fw-medium text-dark shadow-none"
                                            value={selectedMeta?.vendedor || ''}
                                            onChange={(e) => setSelectedMeta({ ...selectedMeta, vendedor: e.target.value ? parseInt(e.target.value) : undefined })}
                                        >
                                            <option value="">Meta Global (Toda a Empresa)</option>
                                            {vendedores.map((v: User) => <option key={v.id} value={v.id}>{v.first_name} {v.last_name}</option>)}
                                        </Form.Select>
                                    </InputGroup>
                                </Form.Group>
                            </Col>

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
                                    <Form.Text className="text-muted x-small">Este valor será o benchmark para o atingimento do time.</Form.Text>
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
                message={`Deseja realmente excluir a meta de ${selectedMeta?.mes_nome}/${selectedMeta?.ano}? Esta ação removerá o objetivo do dashboard.`}
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
                
                .modal-premium .modal-content { border-radius: 32px; border: none; box-shadow: 0 30px 70px rgba(0,0,0,0.15); }
                
                .modern-input { border: 1px solid #DFE5EF !important; border-radius: 12px !important; padding: 12px 15px !important; transition: 0.3s; }
                .modern-input:focus { border-color: #5D87FF !important; box-shadow: 0 0 0 4px rgba(93, 135, 255, 0.1) !important; }
                
                .modern-input-group { border: 1px solid #DFE5EF; border-radius: 12px; overflow: hidden; transition: 0.3s; }
                .modern-input-group:focus-within { border-color: #5D87FF; box-shadow: 0 0 0 4px rgba(93, 135, 255, 0.1); }
                
                .datepicker-modern-container { position: relative; width: 100%; }
                .datepicker-modern-container .react-datepicker-wrapper { width: 100%; }
                .datepicker-modern-container .form-control { padding-left: 45px !important; height: 50px; }
                .datepicker-icon { position: absolute; left: 15px; top: 25px; transform: translateY(-50%); z-index: 10; pointer-events: none; }
                
                .react-datepicker { 
                    font-family: 'Plus Jakarta Sans', sans-serif; 
                    border-radius: 20px; 
                    border: none; 
                    box-shadow: 0 15px 40px rgba(0,0,0,0.15); 
                    padding: 15px;
                    width: 300px;
                }
                .react-datepicker__header { background-color: #fff; border-bottom: none; padding-top: 10px; }
                .react-datepicker__current-month { color: #2A3547; font-weight: 800; font-size: 16px; margin-bottom: 15px; }
                .react-datepicker__month-container { width: 100%; }
                .react-datepicker__month { margin: 0; }
                
                .react-datepicker__month-text { 
                    display: inline-block !important;
                    width: 28% !important;
                    padding: 12px 0 !important; 
                    margin: 6px 2.5% !important; 
                    font-weight: 600; 
                    font-size: 13px; 
                    color: #5A6A83; 
                    border-radius: 12px !important; 
                    transition: 0.2s; 
                }
                .react-datepicker__month-text--keyboard-selected, .react-datepicker__month-text--selected { 
                    background-color: #5D87FF !important; 
                    color: #fff !important; 
                    box-shadow: 0 4px 12px rgba(93, 135, 255, 0.3); 
                }
                .react-datepicker__month-text:hover { background-color: #ECF2FF !important; color: #5D87FF !important; }
                .react-datepicker__month-text--disabled { color: #D1D9E2 !important; background-color: transparent !important; cursor: not-allowed; }
                
                .react-datepicker__navigation { top: 18px; }
                .react-datepicker__navigation--next { right: 15px; }
                .react-datepicker__navigation--previous { left: 15px; }
            `}</style>
        </Container>
    );
};

export default Metas;
