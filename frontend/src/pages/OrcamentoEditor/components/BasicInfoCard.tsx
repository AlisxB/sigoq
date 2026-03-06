import React from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';
import { Cliente, User, Orcamento } from '../../../types';

interface BasicInfoCardProps {
    orcamento: Partial<Orcamento>;
    clientes: Cliente[];
    vendedores: User[];
    onUpdate: (field: keyof Orcamento, value: any) => void;
}

const BasicInfoCard: React.FC<BasicInfoCardProps> = ({ orcamento, clientes, vendedores, onUpdate }) => {
    return (
        <Card className="card-premium mb-4">
            <Card.Body>
                <h5 className="card-title fw-bold mb-4">Informações Básicas</h5>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small">Cliente</Form.Label>
                            <Form.Select
                                disabled
                                className="text-dark bg-light"
                                value={orcamento.cliente || ''}
                                onChange={(e) => onUpdate('cliente', parseInt(e.target.value))}
                            >
                                <option value="" className="text-dark">Selecione o Cliente</option>
                                {clientes?.map(c => <option key={c.id} value={c.id} className="text-dark">{c.razao_social}</option>)}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small">Vendedor Responsável</Form.Label>
                            <Form.Select
                                disabled
                                className="text-dark bg-light"
                                value={orcamento.vendedor || ''}
                                onChange={(e) => onUpdate('vendedor', e.target.value ? parseInt(e.target.value) : null)}
                            >
                                <option value="" className="text-dark">Selecione o Vendedor</option>
                                {vendedores.map((v: User) => (
                                    <option key={v.id} value={v.id} className="text-dark">{v.first_name} {v.last_name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small">Validade (Dias)</Form.Label>
                            <Form.Control
                                type="number"
                                value={orcamento.validade_dias || 15}
                                onChange={(e) => onUpdate('validade_dias', parseInt(e.target.value))}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small">Margem (%)</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                value={(parseFloat(orcamento.margem_contrib || '0') * 100).toFixed(2)}
                                onChange={(e) => {
                                    const newMargin = (parseFloat(e.target.value) / 100).toString();
                                    onUpdate('margem_contrib', newMargin);
                                }}
                                isInvalid={parseFloat(orcamento.margem_contrib || '0') < 0.15}
                            />
                            <Form.Control.Feedback type="invalid">Margem abaixo do mínimo (15%)</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

export default BasicInfoCard;
