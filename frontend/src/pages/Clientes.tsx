import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import GenericCRUD from '../components/GenericCRUD';
import { clienteApi } from '../api/clientes';
import { usuarioApi } from '../api/usuarios';
import { Cliente, User } from '../types';
import { useQuery } from '@tanstack/react-query';

const Clientes: React.FC = () => {
    const { data: vendedores = [] } = useQuery({
        queryKey: ['vendedores'],
        queryFn: () => usuarioApi.list({ role: 'COMERCIAL' })
    });
    const columns = [
        { header: 'Nome/Razão Social', accessor: (item: Cliente) => item.nome_fantasia || item.razao_social },
        { header: 'Doc (CPF/CNPJ)', accessor: (item: Cliente) => item.cnpj || item.cpf || '-' },
        { header: 'E-mail', accessor: 'email' as const },
        { header: 'Cidade/UF', accessor: (item: Cliente) => `${item.cidade}/${item.estado}` },
    ];

    const renderForm = (data: Partial<Cliente>, onChange: (field: keyof Cliente, value: any) => void) => (
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
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="fw-bold small">CNPJ</Form.Label>
                    <Form.Control
                        value={data.cnpj || ''}
                        onChange={(e) => onChange('cnpj', e.target.value)}
                        disabled={!!data.cpf}
                        style={{ borderRadius: '10px' }}
                    />
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="fw-bold small">CPF</Form.Label>
                    <Form.Control
                        value={data.cpf || ''}
                        onChange={(e) => onChange('cpf', e.target.value)}
                        disabled={!!data.cnpj}
                        style={{ borderRadius: '10px' }}
                    />
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="fw-bold small">IE</Form.Label>
                    <Form.Control
                        value={data.inscricao_estadual || ''}
                        onChange={(e) => onChange('inscricao_estadual', e.target.value)}
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
            <Col md={12}>
                <Form.Group>
                    <Form.Label className="fw-bold small">Endereço Completo</Form.Label>
                    <Form.Control
                        required
                        value={data.endereco || ''}
                        onChange={(e) => onChange('endereco', e.target.value)}
                        style={{ borderRadius: '10px' }}
                    />
                </Form.Group>
            </Col>
            <Col md={8}>
                <Form.Group>
                    <Form.Label className="fw-bold small">Cidade</Form.Label>
                    <Form.Control
                        required
                        value={data.cidade || ''}
                        onChange={(e) => onChange('cidade', e.target.value)}
                        style={{ borderRadius: '10px' }}
                    />
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="fw-bold small">Estado (UF)</Form.Label>
                    <Form.Control
                        required
                        maxLength={2}
                        value={data.estado || ''}
                        onChange={(e) => onChange('estado', e.target.value.toUpperCase())}
                        style={{ borderRadius: '10px' }}
                    />
                </Form.Group>
            </Col>
            <Col md={12}>
                <Form.Group>
                    <Form.Label className="fw-bold small">Vendedor Responsável</Form.Label>
                    <Form.Select
                        value={data.vendedor || ''}
                        onChange={(e) => onChange('vendedor', e.target.value ? parseInt(e.target.value) : null)}
                        style={{ borderRadius: '10px' }}
                    >
                        <option value="">Selecione um vendedor...</option>
                        {vendedores.map((v: User) => (
                            <option key={v.id} value={v.id}>{v.first_name} {v.last_name}</option>
                        ))}
                    </Form.Select>
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
        <GenericCRUD<Cliente>
            title="Gestão de Clientes"
            entityName="Cliente"
            api={clienteApi}
            columns={columns}
            renderForm={renderForm}
            initialData={{ razao_social: '', nome_fantasia: '', email: '', telefone: '', endereco: '', cidade: '', estado: '' }}
            queryKey="clientes"
        />
    );
};

export default Clientes;
