import React from 'react';
import { Card, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { User, Calendar, Percent, Users } from 'lucide-react';
import { Cliente, User as UserType, Orcamento } from '../../../types';

interface BasicInfoCardProps {
    orcamento: Partial<Orcamento>;
    clientes: Cliente[];
    vendedores: UserType[];
    onUpdate: (field: keyof Orcamento, value: any) => void;
}

const BasicInfoCard: React.FC<BasicInfoCardProps> = ({ orcamento, clientes, vendedores, onUpdate }) => {
    return (
        <Card className="card-premium mb-4 border-0 shadow-sm" style={{ borderRadius: '20px' }}>
            <Card.Body className="p-4">
                <h5 className="card-title fw-bold mb-4 d-flex align-items-center">
                    <Users size={20} className="text-primary me-2" /> Informações Básicas
                </h5>
                <Row className="g-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-bold small text-muted">Cliente</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0">
                                    <User size={18} className="text-muted" />
                                </InputGroup.Text>
                                <Form.Select
                                    disabled
                                    className="text-dark bg-light border-start-0"
                                    value={orcamento.cliente || ''}
                                    onChange={(e) => onUpdate('cliente', parseInt(e.target.value))}
                                >
                                    <option value="" className="text-dark">Selecione o Cliente</option>
                                    {clientes?.map(c => <option key={c.id} value={c.id} className="text-dark">{c.razao_social}</option>)}
                                </Form.Select>
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="fw-bold small text-muted">Vendedor Responsável</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0">
                                    <User size={18} className="text-muted" />
                                </InputGroup.Text>
                                <Form.Select
                                    disabled
                                    className="text-dark bg-light border-start-0"
                                    value={orcamento.vendedor || ''}
                                    onChange={(e) => onUpdate('vendedor', e.target.value ? parseInt(e.target.value) : null)}
                                >
                                    <option value="" className="text-dark">Selecione o Vendedor</option>
                                    {vendedores.map((v: UserType) => (
                                        <option key={v.id} value={v.id} className="text-dark">{v.first_name} {v.last_name}</option>
                                    ))}
                                </Form.Select>
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-bold small text-muted">Validade (Dias)</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-white border-end-0">
                                    <Calendar size={18} className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="number"
                                    placeholder="Ex: 15"
                                    className="border-start-0"
                                    value={orcamento.validade_dias || 15}
                                    onChange={(e) => onUpdate('validade_dias', parseInt(e.target.value))}
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="fw-bold small text-muted">Margem (%)</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-white border-end-0">
                                    <Percent size={18} className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    placeholder="20.00"
                                    className="border-start-0"
                                    value={(parseFloat(orcamento.margem_contrib || '0') * 100).toFixed(2)}
                                    onChange={(e) => {
                                        const newMargin = (parseFloat(e.target.value) / 100).toString();
                                        onUpdate('margem_contrib', newMargin);
                                    }}
                                    isInvalid={parseFloat(orcamento.margem_contrib || '0') < 0.15}
                                />
                                <Form.Control.Feedback type="invalid">Mínimo 15%</Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default BasicInfoCard;
