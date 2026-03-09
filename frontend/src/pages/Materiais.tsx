import React, { useState } from 'react';
import { Form, Row, Col, InputGroup } from 'react-bootstrap';
import GenericCRUD from '../components/GenericCRUD';
import { produtoApi, categoriaApi } from '../api/produtos';
import { fornecedorApi } from '../api/fornecedores';
import { Produto, Categoria, Fornecedor } from '../types';
import { useQuery } from '@tanstack/react-query';
import { keepOnlyNumbers, maskCurrency, unmaskCurrency } from '../utils/masks';
import { Barcode, Box, Layers, Building, Ruler, DollarSign, FileText, PackageSearch, Archive, AlignLeft } from 'lucide-react';
import Autocomplete from '../components/Autocomplete';

const Materiais: React.FC = () => {
    const [categoriaFilter, setCategoriaFilter] = useState<number | string | undefined>('');
    const [fornecedorFilter, setFornecedorFilter] = useState<number | string | undefined>('');

    const { data: categoriasData } = useQuery({ 
        queryKey: ['categorias'], 
        queryFn: () => categoriaApi.list({ page_size: 1000 }) 
    });
    const categorias: Categoria[] = Array.isArray(categoriasData) 
        ? categoriasData 
        : (categoriasData as any)?.results || [];

    const { data: fornecedoresData } = useQuery({ 
        queryKey: ['fornecedores'], 
        queryFn: () => fornecedorApi.list({ page_size: 1000 }) 
    });
    const fornecedores: Fornecedor[] = Array.isArray(fornecedoresData) 
        ? fornecedoresData 
        : (fornecedoresData as any)?.results || [];

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
            <Autocomplete
                className="flex-grow-1"
                style={{ maxWidth: '300px' }}
                label="Filtrar Categoria"
                placeholder="Todas as Categorias"
                options={categorias.map((c: Categoria) => ({ id: c.id, label: c.nome }))}
                value={categoriaFilter}
                onChange={setCategoriaFilter}
                icon={<Layers size={16} className="text-muted" />}
            />
            <Autocomplete
                className="flex-grow-1"
                style={{ maxWidth: '300px' }}
                label="Filtrar Fornecedor"
                placeholder="Todos os Fornecedores"
                options={fornecedores.map((f: Fornecedor) => ({ id: f.id, label: f.nome_fantasia || f.razao_social }))}
                value={fornecedorFilter}
                onChange={setFornecedorFilter}
                icon={<Building size={16} className="text-muted" />}
            />
        </>
    );

    const renderForm = (data: Partial<Produto>, onChange: (field: keyof Produto, value: any) => void) => (
        <Row className="g-3">
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Código</Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0"><Barcode size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            required
                            className="form-control-premium border-start-0"
                            value={data.codigo || ''}
                            onChange={(e) => onChange('codigo', e.target.value)}
                            placeholder="Ex: PRD-001"
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={8}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Descrição</Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0"><Box size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            required
                            className="form-control-premium border-start-0"
                            value={data.descricao || ''}
                            onChange={(e) => onChange('descricao', e.target.value)}
                            placeholder="Ex: Janela de Alumínio"
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={6}>
                <Autocomplete
                    label="Categoria"
                    placeholder="Selecione a Categoria..."
                    options={categorias.map((c: Categoria) => ({ id: c.id, label: c.nome }))}
                    value={data.categoria}
                    onChange={(val) => onChange('categoria', val)}
                    icon={<Layers size={18} className="text-muted" />}
                    required
                />
            </Col>
            <Col md={6}>
                <Autocomplete
                    label="Fornecedor Principal"
                    placeholder="Selecione o Fornecedor..."
                    options={fornecedores.map((f: Fornecedor) => ({ id: f.id, label: f.nome_fantasia || f.razao_social }))}
                    value={data.fornecedor}
                    onChange={(val) => onChange('fornecedor', val)}
                    icon={<Building size={18} className="text-muted" />}
                    required
                />
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Unidade de Medida</Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0"><Ruler size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Select
                            required
                            className="form-select-premium border-start-0"
                            value={data.unidade_medida || 'UN'}
                            onChange={(e) => onChange('unidade_medida', e.target.value)}
                        >
                            <option value="UN">Unidade</option>
                            <option value="M">Metro</option>
                            <option value="KG">Quilograma</option>
                            <option value="PC">Peça</option>
                            <option value="CJ">Conjunto</option>
                        </Form.Select>
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Custo Base (R$)</Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0"><DollarSign size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            required
                            className="form-control-premium border-start-0"
                            value={data.custo_base ? maskCurrency(data.custo_base) : ''}
                            onChange={(e) => {
                                const unmasked = unmaskCurrency(e.target.value);
                                onChange('custo_base', unmasked);
                            }}
                            placeholder="R$ 0,00"
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={12}>
                <Row>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="form-premium-label">NCM</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0"><FileText size={18} className="text-muted" /></InputGroup.Text>
                                <Form.Control
                                    className="form-control-premium border-start-0"
                                    value={data.ncm || ''}
                                    onChange={(e) => onChange('ncm', keepOnlyNumbers(e.target.value))}
                                    placeholder="Apenas números"
                                    maxLength={8}
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="form-premium-label">Estoque Atual</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0"><PackageSearch size={18} className="text-muted" /></InputGroup.Text>
                                <Form.Control
                                    type="number"
                                    className="form-control-premium border-start-0"
                                    value={data.estoque_atual || 0}
                                    onChange={(e) => onChange('estoque_atual', parseInt(e.target.value))}
                                    min={0}
                                    placeholder="0"
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="form-premium-label">Estoque Mínimo</Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0"><Archive size={18} className="text-muted" /></InputGroup.Text>
                                <Form.Control
                                    type="number"
                                    className="form-control-premium border-start-0"
                                    value={data.estoque_minimo || 0}
                                    onChange={(e) => onChange('estoque_minimo', parseInt(e.target.value))}
                                    min={0}
                                    placeholder="0"
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                </Row>
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
                            placeholder="Detalhes adicionais e especificações técnicas..."
                        />
                    </InputGroup>
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
            useInfinite={true}
            extraParams={{
                categoria: categoriaFilter,
                fornecedor: fornecedorFilter
            }}
        />
    );
};

export default Materiais;
