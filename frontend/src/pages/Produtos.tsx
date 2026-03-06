import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import GenericCRUD from '../components/GenericCRUD';
import { produtoApi, categoriaApi } from '../api/produtos';
import { fornecedorApi } from '../api/fornecedores';
import { Produto, Categoria, Fornecedor } from '../types';
import { useQuery } from '@tanstack/react-query';

const Produtos: React.FC = () => {
    const { data: categorias = [] } = useQuery({ queryKey: ['categorias'], queryFn: categoriaApi.list });
    const { data: fornecedores = [] } = useQuery({ queryKey: ['fornecedores'], queryFn: fornecedorApi.list });

    const columns = [
        { header: 'Código', accessor: 'codigo' as const },
        { header: 'Descrição', accessor: 'descricao' as const },
        { header: 'Categoria', accessor: 'categoria_nome' as const },
        { header: 'Preço Custo', accessor: (item: Produto) => `R$ ${parseFloat(item.custo_base).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
        { header: 'Estoque', accessor: 'estoque_atual' as const },
        { header: 'Unid.', accessor: 'unidade_medida' as const },
    ];

    const renderForm = (data: Partial<Produto>, onChange: (field: keyof Produto, value: any) => void) => (
        <Row className="g-3">
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="fw-bold small">Código</Form.Label>
                    <Form.Control
                        required
                        value={data.codigo || ''}
                        onChange={(e) => onChange('codigo', e.target.value)}
                        style={{ borderRadius: '10px' }}
                    />
                </Form.Group>
            </Col>
            <Col md={8}>
                <Form.Group>
                    <Form.Label className="fw-bold small">Descrição</Form.Label>
                    <Form.Control
                        required
                        value={data.descricao || ''}
                        onChange={(e) => onChange('descricao', e.target.value)}
                        style={{ borderRadius: '10px' }}
                    />
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-bold small">Categoria</Form.Label>
                    <Form.Select
                        required
                        value={data.categoria || ''}
                        onChange={(e) => onChange('categoria', parseInt(e.target.value))}
                        style={{ borderRadius: '10px' }}
                    >
                        <option value="">Selecione...</option>
                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </Form.Select>
                </Form.Group>
            </Col>
            <Col md={6}>
                <Form.Group>
                    <Form.Label className="fw-bold small">Fornecedor Principal</Form.Label>
                    <Form.Select
                        required
                        value={data.fornecedor || ''}
                        onChange={(e) => onChange('fornecedor', parseInt(e.target.value))}
                        style={{ borderRadius: '10px' }}
                    >
                        <option value="">Selecione...</option>
                        {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome_fantasia || f.razao_social}</option>)}
                    </Form.Select>
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="fw-bold small">Unidade de Medida</Form.Label>
                    <Form.Select
                        required
                        value={data.unidade_medida || 'UN'}
                        onChange={(e) => onChange('unidade_medida', e.target.value)}
                        style={{ borderRadius: '10px' }}
                    >
                        <option value="UN">Unidade</option>
                        <option value="M">Metro</option>
                        <option value="KG">Quilograma</option>
                        <option value="PC">Peça</option>
                        <option value="CJ">Conjunto</option>
                    </Form.Select>
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="fw-bold small">Custo Base (R$)</Form.Label>
                    <Form.Control
                        required
                        type="number"
                        step="0.01"
                        value={data.custo_base || ''}
                        onChange={(e) => onChange('custo_base', e.target.value)}
                        style={{ borderRadius: '10px' }}
                    />
                </Form.Group>
            </Col>
            <Col md={12}>
                <Row>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="fw-bold small">NCM</Form.Label>
                            <Form.Control
                                value={data.ncm || ''}
                                onChange={(e) => onChange('ncm', e.target.value)}
                                style={{ borderRadius: '10px' }}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="fw-bold small">Estoque Atual</Form.Label>
                            <Form.Control
                                type="number"
                                value={data.estoque_atual || 0}
                                onChange={(e) => onChange('estoque_atual', parseInt(e.target.value))}
                                style={{ borderRadius: '10px' }}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="fw-bold small">Estoque Mínimo</Form.Label>
                            <Form.Control
                                type="number"
                                value={data.estoque_minimo || 0}
                                onChange={(e) => onChange('estoque_minimo', parseInt(e.target.value))}
                                style={{ borderRadius: '10px' }}
                            />
                        </Form.Group>
                    </Col>
                </Row>
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
        <GenericCRUD<Produto>
            title="Catálogo de Produtos"
            entityName="Produto"
            api={produtoApi}
            columns={columns}
            renderForm={renderForm}
            initialData={{ codigo: '', descricao: '', unidade_medida: 'UN', custo_base: '0.00', estoque_minimo: 0 }}
            queryKey="produtos"
        />
    );
};

export default Produtos;
