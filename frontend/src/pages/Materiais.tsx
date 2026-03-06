import React, { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import GenericCRUD from '../components/GenericCRUD';
import { produtoApi, categoriaApi } from '../api/produtos';
import { fornecedorApi } from '../api/fornecedores';
import { Produto, User } from '../types';
import { useQuery } from '@tanstack/react-query';
import { keepOnlyNumbers, maskCurrency, unmaskCurrency } from '../utils/masks';
import { Barcode, Box, Layers, Building, Ruler, DollarSign, FileText, PackageSearch, Archive, AlignLeft, Filter } from 'lucide-react';

const Materiais: React.FC = () => {
    const [categoriaFilter, setCategoriaFilter] = useState<string>('');
    const [fornecedorFilter, setFornecedorFilter] = useState<string>('');

    const { data: categorias = [] } = useQuery({ queryKey: ['categorias'], queryFn: categoriaApi.list });
    const { data: fornecedores = [] } = useQuery({ queryKey: ['fornecedores'], queryFn: fornecedorApi.list });

    const columns = [
        { header: 'Código', accessor: 'codigo' as const },
        { header: 'Descrição', accessor: 'descricao' as const },
        { header: 'Categoria', accessor: 'categoria_nome' as const },
        { header: 'Fornecedor', accessor: 'fornecedor_nome' as const },
        { header: 'Preço Custo', accessor: (item: Produto) => `R$ ${parseFloat(item.custo_base).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
        { header: 'Estoque', accessor: 'estoque_atual' as const },
        { header: 'Unid.', accessor: 'unidade_medida' as const },
    ];

    const renderFilters = () => (
        <>
            <div style={{ flex: '1 1 200px', maxWidth: '300px' }}>
                <Form.Label className="form-premium-label">Filtrar Categoria</Form.Label>
                <div className="input-icon-wrapper">
                    <Layers size={16} />
                    <Form.Select
                        className="form-select-premium ps-4"
                        value={categoriaFilter}
                        onChange={(e) => setCategoriaFilter(e.target.value)}
                    >
                        <option value="">Todas as Categorias</option>
                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </Form.Select>
                </div>
            </div>
            <div style={{ flex: '1 1 200px', maxWidth: '300px' }}>
                <Form.Label className="form-premium-label">Filtrar Fornecedor</Form.Label>
                <div className="input-icon-wrapper">
                    <Building size={16} />
                    <Form.Select
                        className="form-select-premium ps-4"
                        value={fornecedorFilter}
                        onChange={(e) => setFornecedorFilter(e.target.value)}
                    >
                        <option value="">Todos os Fornecedores</option>
                        {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome_fantasia || f.razao_social}</option>)}
                    </Form.Select>
                </div>
            </div>
        </>
    );

    const filterFn = (item: Produto) => {
        const matchesCat = categoriaFilter ? item.categoria === parseInt(categoriaFilter) : true;
        const matchesFor = fornecedorFilter ? item.fornecedor === parseInt(fornecedorFilter) : true;
        return matchesCat && matchesFor;
    };

    const renderForm = (data: Partial<Produto>, onChange: (field: keyof Produto, value: any) => void) => (
        <Row className="g-3">
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Código</Form.Label>
                    <div className="input-icon-wrapper">
                        <Barcode size={18} />
                        <Form.Control
                            required
                            className="form-control-premium"
                            value={data.codigo || ''}
                            onChange={(e) => onChange('codigo', e.target.value)}
                            placeholder="Ex: PRD-001"
                        />
                    </div>
                </Form.Group>
            </Col>
            <Col md={8}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Descrição</Form.Label>
                    <div className="input-icon-wrapper">
                        <Box size={18} />
                        <Form.Control
                            required
                            className="form-control-premium"
                            value={data.descricao || ''}
                            onChange={(e) => onChange('descricao', e.target.value)}
                            placeholder="Ex: Janela de Alumínio"
                        />
                    </div>
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Categoria</Form.Label>
                    <div className="input-icon-wrapper">
                        <Layers size={18} />
                        <Form.Select
                            required
                            className="form-select-premium"
                            value={data.categoria || ''}
                            onChange={(e) => onChange('categoria', parseInt(e.target.value))}
                        >
                            <option value="">Selecione...</option>
                            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </Form.Select>
                    </div>
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Fornecedor Principal</Form.Label>
                    <div className="input-icon-wrapper">
                        <Building size={18} />
                        <Form.Select
                            required
                            className="form-select-premium"
                            value={data.fornecedor || ''}
                            onChange={(e) => onChange('fornecedor', parseInt(e.target.value))}
                        >
                            <option value="">Selecione...</option>
                            {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome_fantasia || f.razao_social}</option>)}
                        </Form.Select>
                    </div>
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Unidade de Medida</Form.Label>
                    <div className="input-icon-wrapper">
                        <Ruler size={18} />
                        <Form.Select
                            required
                            className="form-select-premium"
                            value={data.unidade_medida || 'UN'}
                            onChange={(e) => onChange('unidade_medida', e.target.value)}
                        >
                            <option value="UN">Unidade</option>
                            <option value="M">Metro</option>
                            <option value="KG">Quilograma</option>
                            <option value="PC">Peça</option>
                            <option value="CJ">Conjunto</option>
                        </Form.Select>
                    </div>
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Custo Base (R$)</Form.Label>
                    <div className="input-icon-wrapper">
                        <DollarSign size={18} />
                        <Form.Control
                            required
                            className="form-control-premium"
                            value={data.custo_base ? maskCurrency(data.custo_base) : ''}
                            onChange={(e) => {
                                const unmasked = unmaskCurrency(e.target.value);
                                onChange('custo_base', unmasked);
                            }}
                            placeholder="R$ 0,00"
                        />
                    </div>
                </Form.Group>
            </Col>
            <Col md={12}>
                <Row>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="form-premium-label">NCM</Form.Label>
                            <div className="input-icon-wrapper">
                                <FileText size={18} />
                                <Form.Control
                                    className="form-control-premium"
                                    value={data.ncm || ''}
                                    onChange={(e) => onChange('ncm', keepOnlyNumbers(e.target.value))}
                                    placeholder="Apenas números"
                                    maxLength={8}
                                />
                            </div>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="form-premium-label">Estoque Atual</Form.Label>
                            <div className="input-icon-wrapper">
                                <PackageSearch size={18} />
                                <Form.Control
                                    type="number"
                                    className="form-control-premium"
                                    value={data.estoque_atual || 0}
                                    onChange={(e) => onChange('estoque_atual', parseInt(e.target.value))}
                                    min={0}
                                />
                            </div>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="form-premium-label">Estoque Mínimo</Form.Label>
                            <div className="input-icon-wrapper">
                                <Archive size={18} />
                                <Form.Control
                                    type="number"
                                    className="form-control-premium"
                                    value={data.estoque_minimo || 0}
                                    onChange={(e) => onChange('estoque_minimo', parseInt(e.target.value))}
                                    min={0}
                                />
                            </div>
                        </Form.Group>
                    </Col>
                </Row>
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
                            placeholder="Detalhes adicionais e especificações técnicas..."
                        />
                    </div>
                </Form.Group>
            </Col>
        </Row>
    );

    return (
        <GenericCRUD<Produto>
            title="Catálogo de Materiais"
            entityName="Material"
            api={produtoApi}
            columns={columns}
            renderForm={renderForm}
            initialData={{ codigo: '', descricao: '', unidade_medida: 'UN', custo_base: '0.00', estoque_minimo: 0 }}
            queryKey="produtos"
            renderFilters={renderFilters}
            filterFn={filterFn}
        />
    );
};

export default Materiais;
