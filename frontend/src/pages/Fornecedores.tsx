import React from 'react';
import { Form, Row, Col, InputGroup } from 'react-bootstrap';
import GenericCRUD from '../components/GenericCRUD';
import { fornecedorApi } from '../api/fornecedores';
import { Fornecedor } from '../types';
import { keepOnlyNumbers, maskCNPJ, maskPhone } from '../utils/masks';
import { Building, Briefcase, FileText, Mail, Phone, User, CalendarClock, AlignLeft } from 'lucide-react';

const Fornecedores: React.FC = () => {
    const columns = [
        { header: 'Nome Fantasia', accessor: 'nome_fantasia' as const },
        { 
            header: 'CNPJ', 
            accessor: (item: Fornecedor) => item.cnpj ? maskCNPJ(item.cnpj) : '---'
        },
        { header: 'E-mail', accessor: 'email' as const },
        { 
            header: 'Telefone', 
            accessor: (item: Fornecedor) => item.telefone ? maskPhone(item.telefone) : '---'
        },
    ];

    const renderForm = (data: Partial<Fornecedor>, onChange: (field: keyof Fornecedor, value: any) => void) => (
        <Row className="g-3">
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Razão Social</Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0"><Building size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            required
                            className="form-control-premium border-start-0"
                            value={data.razao_social || ''}
                            onChange={(e) => onChange('razao_social', e.target.value)}
                            placeholder="Ex: Indústria XYZ Ltda"
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Nome Fantasia</Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0"><Briefcase size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            className="form-control-premium border-start-0"
                            value={data.nome_fantasia || ''}
                            onChange={(e) => onChange('nome_fantasia', e.target.value)}
                            placeholder="Ex: Grupo XYZ"
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="form-premium-label">CNPJ</Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0"><FileText size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            required
                            className="form-control-premium border-start-0"
                            value={data.cnpj ? maskCNPJ(data.cnpj) : ''}
                            onChange={(e) => onChange('cnpj', keepOnlyNumbers(e.target.value))}
                            placeholder="00.000.000/0000-00"
                            maxLength={18}
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="form-premium-label">E-mail</Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0"><Mail size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            required
                            type="email"
                            className="form-control-premium border-start-0"
                            value={data.email || ''}
                            onChange={(e) => onChange('email', e.target.value)}
                            placeholder="comercial@fornecedor.com.br"
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Telefone</Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0"><Phone size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            required
                            className="form-control-premium border-start-0"
                            value={data.telefone ? maskPhone(data.telefone) : ''}
                            onChange={(e) => onChange('telefone', keepOnlyNumbers(e.target.value))}
                            placeholder="(00) 0000-0000"
                            maxLength={15}
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={3}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Nome Contato</Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0"><User size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            className="form-control-premium border-start-0"
                            value={data.contato_nome || ''}
                            onChange={(e) => onChange('contato_nome', e.target.value)}
                            placeholder="Ex: João Silva"
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={3}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Prazo Entrega (Dias)</Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0"><CalendarClock size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            type="number"
                            className="form-control-premium border-start-0"
                            value={data.prazo_entrega_medio || ''}
                            onChange={(e) => onChange('prazo_entrega_medio', parseInt(e.target.value))}
                            placeholder="Ex: 5"
                            min={0}
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={12}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Observações</Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0 align-items-start pt-3"><AlignLeft size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            className="form-control-premium border-start-0"
                            value={data.observacoes || ''}
                            onChange={(e) => onChange('observacoes', e.target.value)}
                            placeholder="Informações adicionais sobre produtos e logística..."
                        />
                    </InputGroup>
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
            useInfinite={true}
        />
    );
};

export default Fornecedores;
