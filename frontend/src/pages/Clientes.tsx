import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Building, Briefcase, Hash, FileText, Mail, Phone, MapPin, Map, UserCircle, AlignLeft } from 'lucide-react';
import GenericCRUD from '../components/GenericCRUD';
import { clienteApi } from '../api/clientes';
import { usuarioApi } from '../api/usuarios';
import { Cliente, User } from '../types';
import { useQuery } from '@tanstack/react-query';
import { keepOnlyNumbers, maskCPF, maskCNPJ, maskPhone } from '../utils/masks';

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
                    <Form.Label className="form-premium-label">Razão Social</Form.Label>
                    <div className="input-icon-wrapper">
                        <Building size={18} />
                        <Form.Control
                            required
                            className="form-control-premium"
                            value={data.razao_social || ''}
                            onChange={(e) => onChange('razao_social', e.target.value)}
                            placeholder="Ex: Empresa Silva Ltda"
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
                            placeholder="Ex: Silva Comércio"
                        />
                    </div>
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="form-premium-label">CNPJ</Form.Label>
                    <div className="input-icon-wrapper">
                        <FileText size={18} />
                        <Form.Control
                            className="form-control-premium"
                            value={data.cnpj ? maskCNPJ(data.cnpj) : ''}
                            onChange={(e) => onChange('cnpj', keepOnlyNumbers(e.target.value))}
                            disabled={!!data.cpf}
                            placeholder="00.000.000/0000-00"
                            maxLength={18}
                        />
                    </div>
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="form-premium-label">CPF</Form.Label>
                    <div className="input-icon-wrapper">
                        <FileText size={18} />
                        <Form.Control
                            className="form-control-premium"
                            value={data.cpf ? maskCPF(data.cpf) : ''}
                            onChange={(e) => onChange('cpf', keepOnlyNumbers(e.target.value))}
                            disabled={!!data.cnpj}
                            placeholder="000.000.000-00"
                            maxLength={14}
                        />
                    </div>
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="form-premium-label">IE</Form.Label>
                    <div className="input-icon-wrapper">
                        <Hash size={18} />
                        <Form.Control
                            className="form-control-premium"
                            value={data.inscricao_estadual || ''}
                            onChange={(e) => onChange('inscricao_estadual', keepOnlyNumbers(e.target.value))}
                            placeholder="Apenas números"
                            maxLength={15}
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
                            placeholder="contato@empresa.com.br"
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
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                        />
                    </div>
                </Form.Group>
            </Col>
            <Col md={12}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Endereço Completo</Form.Label>
                    <div className="input-icon-wrapper">
                        <MapPin size={18} />
                        <Form.Control
                            required
                            className="form-control-premium"
                            value={data.endereco || ''}
                            onChange={(e) => onChange('endereco', e.target.value)}
                            placeholder="Rua, número, complemento, bairro"
                        />
                    </div>
                </Form.Group>
            </Col>
            <Col md={8}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Cidade</Form.Label>
                    <div className="input-icon-wrapper">
                        <Map size={18} />
                        <Form.Control
                            required
                            className="form-control-premium"
                            value={data.cidade || ''}
                            onChange={(e) => onChange('cidade', e.target.value)}
                            placeholder="Ex: São Paulo"
                        />
                    </div>
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Estado (UF)</Form.Label>
                    <div className="input-icon-wrapper">
                        <Map size={18} />
                        <Form.Control
                            required
                            className="form-control-premium"
                            maxLength={2}
                            value={data.estado || ''}
                            onChange={(e) => onChange('estado', e.target.value.toUpperCase().replace(/[^a-zA-Z]/g, ''))}
                            placeholder="Ex: SP"
                        />
                    </div>
                </Form.Group>
            </Col>
            <Col md={12}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Vendedor Responsável</Form.Label>
                    <div className="input-icon-wrapper">
                        <UserCircle size={18} />
                        <Form.Select
                            className="form-select-premium"
                            value={data.vendedor || ''}
                            onChange={(e) => onChange('vendedor', e.target.value ? parseInt(e.target.value) : null)}
                        >
                            <option value="">Selecione um vendedor...</option>
                            {vendedores.map((v: User) => (
                                <option key={v.id} value={v.id}>{v.first_name} {v.last_name}</option>
                            ))}
                        </Form.Select>
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
                            placeholder="Informações adicionais do cliente..."
                        />
                    </div>
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
