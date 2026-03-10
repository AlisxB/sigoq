import React, { useMemo, useState } from 'react';
import { Form, Row, Col, InputGroup, Spinner } from 'react-bootstrap';
import { 
    Building, Briefcase, Hash, FileText, Mail, Phone, 
    MapPin, Map, UserCircle, AlignLeft, Home, Info, Locate, User as UserIcon 
} from 'lucide-react';
import GenericCRUD from '../components/GenericCRUD';
import { clienteApi } from '../api/clientes';
import { usuarioApi } from '../api/usuarios';
import { useAuth } from '../contexts/AuthContext';
import { Cliente, User } from '../types';
import { useQuery } from '@tanstack/react-query';
import { keepOnlyNumbers, maskCPF, maskCNPJ, maskPhone, maskCEP } from '../utils/masks';

const Clientes: React.FC = () => {
    const { user } = useAuth();
    
    // Admins e Orçamentistas vêem tudo e podem trocar o vendedor
    const isAdmin = useMemo(() => {
        return user?.role === 'ADMIN' || user?.role === 'ORCAMENTISTA';
    }, [user]);

    const { data: vendedoresData, isLoading: loadingVendedores } = useQuery({
        queryKey: ['vendedores-select'], // Usando chave única para evitar conflitos
        queryFn: () => usuarioApi.list({ role: 'VENDEDOR', page_size: 1000 }),
        enabled: !!user && isAdmin 
    });

    const vendedores: User[] = useMemo(() => {
        if (!vendedoresData) return [];
        const data = vendedoresData;
        if (Array.isArray(data)) return data;
        if (data && data.results && Array.isArray(data.results)) return data.results;
        return [];
    }, [vendedoresData]);

    const isOnlyAdmin = useMemo(() => user?.role === 'ADMIN', [user]);

    const columns = useMemo(() => {
        const baseColumns = [
            { header: 'Nome/Razão Social', accessor: (item: Cliente) => item.nome_fantasia || item.razao_social },
            { 
                header: 'Doc (CPF/CNPJ)', 
                accessor: (item: Cliente) => item.cnpj ? maskCNPJ(item.cnpj) : (item.cpf ? maskCPF(item.cpf) : '---')
            },
            { header: 'E-mail', accessor: 'email' as const },
            { header: 'Cidade/UF', accessor: (item: Cliente) => `${item.cidade || ''}/${item.estado || ''}` },
        ];

        if (isOnlyAdmin) {
            baseColumns.push({ 
                header: 'Vendedor', 
                accessor: (item: any) => item.vendedor_nome || '---' 
            });
        }

        return baseColumns;
    }, [isOnlyAdmin]);

    const initialData = useMemo(() => ({
        razao_social: '',
        nome_fantasia: '',
        email: '',
        telefone: '',
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        vendedor: user?.role === 'VENDEDOR' ? user.id : undefined
    }), [user]);

    const renderForm = (data: Partial<Cliente>, onChange: (field: keyof Cliente, value: any) => void) => (
        <Row className="g-3">
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Razão Social</Form.Label>
                    <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                        <InputGroup.Text className="bg-light border-0"><Building size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            required
                            className="border-0 shadow-none py-2"
                            value={data.razao_social || ''}
                            onChange={(e) => onChange('razao_social', e.target.value)}
                            placeholder="Ex: Empresa Silva Ltda"
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Nome Fantasia</Form.Label>
                    <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                        <InputGroup.Text className="bg-light border-0"><Briefcase size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            className="border-0 shadow-none py-2"
                            value={data.nome_fantasia || ''}
                            onChange={(e) => onChange('nome_fantasia', e.target.value)}
                            placeholder="Ex: Silva Comércio"
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="form-premium-label">CNPJ</Form.Label>
                    <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                        <InputGroup.Text className="bg-light border-0"><FileText size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            className="border-0 shadow-none py-2"
                            value={data.cnpj ? maskCNPJ(data.cnpj) : ''}
                            onChange={(e) => onChange('cnpj', keepOnlyNumbers(e.target.value))}
                            disabled={!!data.cpf}
                            placeholder="00.000.000/0000-00"
                            maxLength={18}
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="form-premium-label">CPF</Form.Label>
                    <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                        <InputGroup.Text className="bg-light border-0"><FileText size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            className="border-0 shadow-none py-2"
                            value={data.cpf ? maskCPF(data.cpf) : ''}
                            onChange={(e) => onChange('cpf', keepOnlyNumbers(e.target.value))}
                            disabled={!!data.cnpj}
                            placeholder="000.000.000-00"
                            maxLength={14}
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="form-premium-label">IE</Form.Label>
                    <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                        <InputGroup.Text className="bg-light border-0"><Hash size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            className="border-0 shadow-none py-2"
                            value={data.inscricao_estadual || ''}
                            onChange={(e) => onChange('inscricao_estadual', keepOnlyNumbers(e.target.value))}
                            placeholder="Apenas números"
                            maxLength={15}
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="form-premium-label">E-mail</Form.Label>
                    <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                        <InputGroup.Text className="bg-light border-0"><Mail size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            required
                            type="email"
                            className="border-0 shadow-none py-2"
                            value={data.email || ''}
                            onChange={(e) => onChange('email', e.target.value)}
                            placeholder="contato@empresa.com.br"
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Telefone</Form.Label>
                    <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                        <InputGroup.Text className="bg-light border-0"><Phone size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            required
                            className="border-0 shadow-none py-2"
                            value={data.telefone ? maskPhone(data.telefone) : ''}
                            onChange={(e) => onChange('telefone', keepOnlyNumbers(e.target.value))}
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={3}>
                <Form.Group>
                    <Form.Label className="form-premium-label">CEP</Form.Label>
                    <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                        <InputGroup.Text className="bg-light border-0"><MapPin size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            className="border-0 shadow-none py-2"
                            value={data.cep ? maskCEP(data.cep) : ''}
                            onChange={(e) => {
                                const val = keepOnlyNumbers(e.target.value);
                                onChange('cep', val);
                                if (val.length === 8) {
                                    fetch(`https://viacep.com.br/ws/${val}/json/`)
                                        .then(res => res.json())
                                        .then(viaCepData => {
                                            if (!viaCepData.erro) {
                                                onChange('logradouro', viaCepData.logradouro);
                                                onChange('bairro', viaCepData.bairro);
                                                onChange('cidade', viaCepData.localidade);
                                                onChange('estado', viaCepData.uf);
                                            }
                                        })
                                        .catch(err => console.error("Erro ao buscar CEP", err));
                                }
                            }}
                            placeholder="00000-000"
                            maxLength={9}
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={7}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Logradouro (Rua)</Form.Label>
                    <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                        <InputGroup.Text className="bg-light border-0"><MapPin size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            className="border-0 shadow-none py-2"
                            value={data.logradouro || ''}
                            onChange={(e) => onChange('logradouro', e.target.value)}
                            placeholder="Rua, Avenida, etc"
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={2}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Número</Form.Label>
                    <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                        <InputGroup.Text className="bg-light border-0"><Home size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            className="border-0 shadow-none py-2"
                            value={data.numero || ''}
                            onChange={(e) => onChange('numero', e.target.value)}
                            placeholder="Ex: 10A"
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Complemento</Form.Label>
                    <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                        <InputGroup.Text className="bg-light border-0"><Info size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            className="border-0 shadow-none py-2"
                            value={data.complemento || ''}
                            onChange={(e) => onChange('complemento', e.target.value)}
                            placeholder="Ex: Sala 2"
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Bairro</Form.Label>
                    <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                        <InputGroup.Text className="bg-light border-0"><Locate size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            className="border-0 shadow-none py-2"
                            value={data.bairro || ''}
                            onChange={(e) => onChange('bairro', e.target.value)}
                            placeholder="Bairro"
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Cidade</Form.Label>
                    <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                        <InputGroup.Text className="bg-light border-0"><Map size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            className="border-0 shadow-none py-2"
                            value={data.cidade || ''}
                            onChange={(e) => onChange('cidade', e.target.value)}
                            placeholder="Cidade"
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={12} className="mb-2">
                <Form.Group>
                    <Form.Label className="form-premium-label">Estado (UF)</Form.Label>
                    <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                        <InputGroup.Text className="bg-light border-0"><Map size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            required
                            className="border-0 shadow-none py-2"
                            maxLength={2}
                            value={data.estado || ''}
                            onChange={(e) => onChange('estado', e.target.value.toUpperCase().replace(/[^a-zA-Z]/g, ''))}
                            placeholder="Ex: SP"
                        />
                    </InputGroup>
                </Form.Group>
            </Col>

            {isAdmin && (
                <Col md={12}>
                    <Form.Group>
                        <Form.Label className="form-premium-label">Vendedor Responsável</Form.Label>
                        <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                            <InputGroup.Text className="bg-light border-0"><UserCircle size={18} className="text-muted" /></InputGroup.Text>
                            <Form.Select
                                className="border-0 shadow-none py-2 ps-0"
                                value={data.vendedor || ''}
                                onChange={(e) => onChange('vendedor', e.target.value ? parseInt(e.target.value) : null)}
                                style={{ color: '#2A3547', opacity: 1 }}
                            >
                                <option value="" style={{ color: '#2A3547' }}>Selecione um vendedor...</option>
                                {vendedores.map((v: User) => (
                                    <option key={v.id} value={v.id} style={{ color: '#2A3547' }}>
                                        {v.full_name || v.username}
                                    </option>
                                ))}
                            </Form.Select>
                        </InputGroup>
                    </Form.Group>
                </Col>
            )}

            <Col md={12}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Observações</Form.Label>
                    <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                        <InputGroup.Text className="bg-light border-0 align-items-start pt-3"><AlignLeft size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            className="border-0 shadow-none py-2"
                            value={data.observacoes || ''}
                            onChange={(e) => onChange('observacoes', e.target.value)}
                            placeholder="Informações adicionais do cliente..."
                        />
                    </InputGroup>
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
            initialData={initialData}
            queryKey="clientes"
            useInfinite={true}
        />
    );
};

export default Clientes;
