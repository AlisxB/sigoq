import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import GenericCRUD from '../components/GenericCRUD';
import { fornecedorApi } from '../api/fornecedores';
import { Fornecedor } from '../types';

const Fornecedores: React.FC = () => {
    const columns = [
        { header: 'Nome Fantasia', accessor: 'nome_fantasia' as const },
        { header: 'CNPJ', accessor: 'cnpj' as const },
        { header: 'E-mail', accessor: 'email' as const },
        { header: 'Telefone', accessor: 'telefone' as const },
    ];

    const renderForm = (data: Partial<Fornecedor>, onChange: (field: keyof Fornecedor, value: any) => void) => (
        <Row className="g-3">
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-bold small">Razão Social</Form.Label>
                    <Form.Control
                        required
                        value={data.razao_social || ''}
                        onChange={(e) => onChange('razao_social', e.target.value)}
                        style={{ borderRadius: '10px' }}
                    />
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-bold small">Nome Fantasia</Form.Label>
                    <Form.Control
                        value={data.nome_fantasia || ''}
                        onChange={(e) => onChange('nome_fantasia', e.target.value)}
                        style={{ borderRadius: '10px' }}
                    />
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-bold small">CNPJ</Form.Label>
                    <Form.Control
                        required
                        value={data.cnpj || ''}
                        onChange={(e) => onChange('cnpj', e.target.value)}
                        style={{ borderRadius: '10px' }}
                    />
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-bold small">E-mail</Form.Label>
                    <Form.Control
                        required
                        type="email"
                        value={data.email || ''}
                        onChange={(e) => onChange('email', e.target.value)}
                        style={{ borderRadius: '10px' }}
                    />
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-bold small">Telefone</Form.Label>
                    <Form.Control
                        required
                        value={data.telefone || ''}
                        onChange={(e) => onChange('telefone', e.target.value)}
                        style={{ borderRadius: '10px' }}
                    />
                </Form.Group>
            </Col>
            <Col md={3}>
                <Form.Group>
                    <Form.Label className="fw-bold small">Nome Contato</Form.Label>
                    <Form.Control
                        value={data.contato_nome || ''}
                        onChange={(e) => onChange('contato_nome', e.target.value)}
                        style={{ borderRadius: '10px' }}
                    />
                </Form.Group>
            </Col>
            <Col md={3}>
                <Form.Group>
                    <Form.Label className="fw-bold small">Prazo Entrega (Dias)</Form.Label>
                    <Form.Control
                        type="number"
                        value={data.prazo_entrega_medio || 0}
                        onChange={(e) => onChange('prazo_entrega_medio', parseInt(e.target.value))}
                        style={{ borderRadius: '10px' }}
                    />
                </Form.Group>
            </Col>
            <Col md={12}>
                <Form.Group>
                    <Form.Label className="fw-bold small">Observações</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        value={data.observacoes || ''}
                        onChange={(e) => onChange('observacoes', e.target.value)}
                        style={{ borderRadius: '10px' }}
                    />
                </Form.Group>
            </Col>
        </Row>
    );

    return (
        <GenericCRUD<Fornecedor>
            title="Gestão de Fornecedores"
            entityName="Fornecedor"
            api={fornecedorApi}
            columns={columns}
            renderForm={renderForm}
            initialData={{ razao_social: '', nome_fantasia: '', cnpj: '', email: '', telefone: '', prazo_entrega_medio: 0 }}
            queryKey="fornecedores"
        />
    );
};

export default Fornecedores;
