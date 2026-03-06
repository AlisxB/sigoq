import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import GenericCRUD from '../components/GenericCRUD';
import { fornecedorApi } from '../api/fornecedores';
import { Fornecedor } from '../types';
import { keepOnlyNumbers, maskCNPJ, maskPhone } from '../utils/masks';
import { Building, Briefcase, FileText, Mail, Phone, User, CalendarClock, AlignLeft } from 'lucide-react';
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
                    <Form.Label className="form-premium-label">Razão Social</Form.Label>
                    <div className="input-icon-wrapper">
                        <Building size={18} />
                        <Form.Control
                            required
                            className="form-control-premium"
                            value={data.razao_social || ''}
                            onChange={(e) => onChange('razao_social', e.target.value)}
                            placeholder="Ex: Indústria XYZ Ltda"
                        />
                    </div>
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Nome Fantasia</Form.Label>
                    <div className="input-icon-wrapper">
                        <Briefcase size={18} />
                        <Form.Control
                            className="form-control-premium"
                            value={data.nome_fantasia || ''}
                            onChange={(e) => onChange('nome_fantasia', e.target.value)}
                            placeholder="Ex: Grupo XYZ"
                        />
                    </div>
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="form-premium-label">CNPJ</Form.Label>
                    <div className="input-icon-wrapper">
                        <FileText size={18} />
                        <Form.Control
                            required
                            className="form-control-premium"
                            value={data.cnpj ? maskCNPJ(data.cnpj) : ''}
                            onChange={(e) => onChange('cnpj', keepOnlyNumbers(e.target.value))}
                            placeholder="00.000.000/0000-00"
                            maxLength={18}
                        />
                    </div>
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="form-premium-label">E-mail</Form.Label>
                    <div className="input-icon-wrapper">
                        <Mail size={18} />
                        <Form.Control
                            required
                            type="email"
                            className="form-control-premium"
                            value={data.email || ''}
                            onChange={(e) => onChange('email', e.target.value)}
                            placeholder="comercial@fornecedor.com.br"
                        />
                    </div>
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Telefone</Form.Label>
                    <div className="input-icon-wrapper">
                        <Phone size={18} />
                        <Form.Control
                            required
                            className="form-control-premium"
                            value={data.telefone ? maskPhone(data.telefone) : ''}
                            onChange={(e) => onChange('telefone', keepOnlyNumbers(e.target.value))}
                            placeholder="(00) 0000-0000"
                            maxLength={15}
                        />
                    </div>
                </Form.Group>
            </Col>
            <Col md={3}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Nome Contato</Form.Label>
                    <div className="input-icon-wrapper">
                        <User size={18} />
                        <Form.Control
                            className="form-control-premium"
                            value={data.contato_nome || ''}
                            onChange={(e) => onChange('contato_nome', e.target.value)}
                            placeholder="Ex: João Silva"
                        />
                    </div>
                </Form.Group>
            </Col>
            <Col md={3}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Prazo Entrega (Dias)</Form.Label>
                    <div className="input-icon-wrapper">
                        <CalendarClock size={18} />
                        <Form.Control
                            type="number"
                            className="form-control-premium"
                            value={data.prazo_entrega_medio || ''}
                            onChange={(e) => onChange('prazo_entrega_medio', parseInt(e.target.value))}
                            placeholder="Ex: 5"
                            min={0}
                        />
                    </div>
                </Form.Group>
            </Col>
            <Col md={12}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Observações</Form.Label>
                    <div className="input-icon-wrapper">
                        <AlignLeft size={18} style={{ top: '24px' }} />
                        <Form.Control
                            as="textarea"
                            rows={2}
                            className="form-control-premium"
                            value={data.observacoes || ''}
                            onChange={(e) => onChange('observacoes', e.target.value)}
                            placeholder="Informações adicionais sobre produtos e logística..."
                        />
                    </div>
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
