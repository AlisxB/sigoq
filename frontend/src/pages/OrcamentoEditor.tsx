import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Row, Col, Card, Button, Form, Table, InputGroup, Badge, Spinner, ListGroup } from 'react-bootstrap';
import { ArrowLeft, Save, Plus, Trash2, Search, Calculator } from 'lucide-react';
import { orcamentoApi } from '../api/orcamentos';
import { clienteApi, produtoApi } from '../api/common';
import { Orcamento, Kit, ItemOrcamento, Cliente, Produto, ConfiguracaoPreco } from '../types';

const OrcamentoEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [localOrcamento, setLocalOrcamento] = useState<Partial<Orcamento>>({
        status: 'RASCUNHO',
        margem_contrib: '0.2000',
        desconto_percent: '0.00',
        kits: []
    });

    const { data: config } = useQuery<ConfiguracaoPreco[]>({
        queryKey: ['config-preco'],
        queryFn: orcamentoApi.getConfig,
    });

    const { data: clientes } = useQuery<Cliente[]>({
        queryKey: ['clientes'],
        queryFn: clienteApi.list,
    });

    const { data: remoteOrcamento, isLoading: isFetchingOrcamento } = useQuery({
        queryKey: ['orcamento', id],
        queryFn: () => orcamentoApi.get(id!),
        enabled: !!id,
    });

    const saveMutation = useMutation({
        mutationFn: (data: Partial<Orcamento>) =>
            id ? orcamentoApi.update(id, data) : orcamentoApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
            navigate('/');
        },
    });

    useEffect(() => {
        if (remoteOrcamento) {
            setLocalOrcamento(remoteOrcamento);
        }
    }, [remoteOrcamento]);

    const calculateTotals = () => {
        if (!config || config.length === 0) return;
        const activeConfig = config[0];
        const margin = parseFloat(localOrcamento.margem_contrib || '0.2000');
        const somaEncargos = parseFloat(activeConfig.markup_engenharia) +
            parseFloat(activeConfig.markup_capitalizacao) +
            parseFloat(activeConfig.markup_frete) +
            parseFloat(activeConfig.markup_imposto) +
            parseFloat(activeConfig.markup_comissao) +
            parseFloat(activeConfig.markup_difal) +
            parseFloat(activeConfig.markup_frete_especial);

        const divisor = 1 - (somaEncargos + margin);

        let totalCusto = 0;
        let totalVenda = 0;

        const updatedKits = localOrcamento.kits?.map(kit => {
            const updatedItens = kit.itens.map(item => {
                const custoUnit = parseFloat(item.custo_unit_snapshot);
                const vlrVenda = divisor > 0 ? custoUnit / divisor : custoUnit * 2;
                const totalItemVenda = (vlrVenda - parseFloat(item.desconto_unit_valor || '0')) * parseFloat(item.quantidade);

                totalCusto += custoUnit * parseFloat(item.quantidade);
                totalVenda += totalItemVenda;

                return { ...item, vlr_unit_venda: vlrVenda.toFixed(2) };
            });
            return { ...kit, itens: updatedItens };
        });

        // Desconto global
        const descontoGlobal = parseFloat(localOrcamento.desconto_percent || '0') / 100;
        totalVenda = totalVenda * (1 - descontoGlobal);

        setLocalOrcamento(prev => ({
            ...prev,
            kits: updatedKits,
            custo_total: totalCusto.toFixed(2),
            valor_total: totalVenda.toFixed(2)
        }));
    };

    const addKit = () => {
        const newKit: Kit = {
            nome: `Novo Kit ${localOrcamento.kits!.length + 1}`,
            descricao: '',
            orcamento: id ? parseInt(id) : 0,
            ordem: localOrcamento.kits!.length + 1,
            itens: []
        };
        setLocalOrcamento(prev => ({ ...prev, kits: [...prev.kits!, newKit] }));
    };

    const addItemToKit = (kitIndex: number, produto: Produto) => {
        const newItem: ItemOrcamento = {
            kit: 0, // Will be set by backend
            produto: produto.id,
            codigo: produto.codigo,
            descricao: produto.descricao,
            quantidade: '1',
            custo_unit_snapshot: produto.custo_base,
            vlr_unit_venda: '0',
            desconto_unit_valor: '0',
            desconto_percent_item: '0'
        };

        const updatedKits = [...localOrcamento.kits!];
        updatedKits[kitIndex].itens.push(newItem);
        setLocalOrcamento(prev => ({ ...prev, kits: updatedKits }));
        calculateTotals();
    };

    if (isFetchingOrcamento) return <Spinner animation="border" />;

    return (
        <div className="pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <Button variant="link" onClick={() => navigate(-1)} className="me-3 p-0 text-dark">
                        <ArrowLeft size={24} />
                    </Button>
                    <h2 className="h3 fw-bold mb-0">
                        {!id ? 'Novo Orçamento' : `ORC-${localOrcamento.numero?.toString().padStart(4, '0')}`}
                    </h2>
                    {localOrcamento.status && (
                        <Badge bg="primary" className="ms-3">{localOrcamento.status}</Badge>
                    )}
                </div>
                <Button
                    variant="success"
                    className="d-flex align-items-center shadow-sm"
                    onClick={() => saveMutation.mutate(localOrcamento)}
                    disabled={saveMutation.isPending}
                >
                    <Save size={18} className="me-2" />
                    {saveMutation.isPending ? 'Salvando...' : 'Salvar Proposta'}
                </Button>
            </div>

            <Row>
                <Col lg={8}>
                    {/* Alerta de Status Crítico */}
                    {localOrcamento.status === 'REVISAO' && (
                        <Card className="bg-warning-subtle border-warning mb-4 shadow-sm">
                            <Card.Body className="d-flex align-items-center">
                                <div className="me-3 fs-4">⚠️</div>
                                <div>
                                    <h6 className="fw-bold mb-1">Este orçamento está sob revisão gerencial</h6>
                                    <p className="small mb-0 text-muted">
                                        {localOrcamento.motivo_rejeicao || 'Alguma regra técnica ou comercial (margem/desconto) disparou a necessidade de aprovação.'}
                                    </p>
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Header Info */}
                    <Card className="card-premium mb-4">
                        <Card.Body>
                            <h5 className="card-title fw-bold mb-4">Informações Básicas</h5>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cliente</Form.Label>
                                        <Form.Select
                                            value={localOrcamento.cliente || ''}
                                            onChange={(e) => setLocalOrcamento({ ...localOrcamento, cliente: parseInt(e.target.value) })}
                                        >
                                            <option value="">Selecione o Cliente</option>
                                            {clientes?.map(c => <option key={c.id} value={c.id}>{c.razao_social}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Validade (Dias)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={localOrcamento.validade_dias || 15}
                                            onChange={(e) => setLocalOrcamento({ ...localOrcamento, validade_dias: parseInt(e.target.value) })}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Margem (%)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            value={(parseFloat(localOrcamento.margem_contrib || '0') * 100).toFixed(2)}
                                            onChange={(e) => {
                                                setLocalOrcamento({ ...localOrcamento, margem_contrib: (parseFloat(e.target.value) / 100).toString() });
                                                setTimeout(calculateTotals, 100);
                                            }}
                                            isInvalid={parseFloat(localOrcamento.margem_contrib || '0') < 0.15}
                                        />
                                        <Form.Control.Feedback type="invalid">Margem abaixo do mínimo (15%)</Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Kits Sections */}
                    {localOrcamento.kits?.map((kit, kIdx) => (
                        <Card key={kIdx} className="card-premium mb-4 border-start border-primary border-4">
                            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                                <h6 className="mb-0 fw-bold text-primary">{kit.nome}</h6>
                                <Button variant="outline-danger" size="sm">
                                    <Trash2 size={14} />
                                </Button>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <Table responsive hover className="mb-0">
                                    <thead className="bg-light small">
                                        <tr>
                                            <th className="ps-4">Item</th>
                                            <th>Qtd</th>
                                            <th>Custo Unit.</th>
                                            <th>Venda Unit.</th>
                                            <th className="text-end pe-4">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {kit.itens.map((item, iIdx) => (
                                            <tr key={iIdx}>
                                                <td className="ps-4">
                                                    <div className="fw-medium">{item.codigo}</div>
                                                    <div className="small text-muted">{item.descricao}</div>
                                                </td>
                                                <td style={{ width: '80px' }}>
                                                    <Form.Control
                                                        size="sm"
                                                        type="number"
                                                        value={item.quantidade}
                                                        onChange={(e) => {
                                                            const updated = [...localOrcamento.kits!];
                                                            updated[kIdx].itens[iIdx].quantidade = e.target.value;
                                                            setLocalOrcamento({ ...localOrcamento, kits: updated });
                                                            calculateTotals();
                                                        }}
                                                    />
                                                </td>
                                                <td>R$ {parseFloat(item.custo_unit_snapshot).toFixed(2)}</td>
                                                <td className="fw-bold text-success">R$ {parseFloat(item.vlr_unit_venda).toFixed(2)}</td>
                                                <td className="text-end pe-4 fw-bold">
                                                    R$ {(parseFloat(item.vlr_unit_venda) * parseFloat(item.quantidade)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td colSpan={5} className="p-3 bg-light">
                                                <ProductSearch onSelect={(p) => addItemToKit(kIdx, p)} />
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    ))}

                    <Button variant="outline-primary" className="w-100 border-dashed py-3 mb-4" onClick={addKit}>
                        <Plus size={18} className="me-2" /> Adicionar Novo Kit de Materiais
                    </Button>
                </Col>

                {/* Sidebar Summary */}
                <Col lg={4}>
                    <Card className="card-premium sticky-top" style={{ top: '100px' }}>
                        <Card.Body>
                            <h5 className="fw-bold mb-4">Resumo Financeiro</h5>

                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Custo Total:</span>
                                <span className="fw-medium">R$ {parseFloat(localOrcamento.custo_total || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>

                            <div className="d-flex justify-content-between mb-4">
                                <span className="text-muted">Markup Médio:</span>
                                <span className="fw-medium">
                                    {localOrcamento.custo_total && parseFloat(localOrcamento.custo_total) > 0
                                        ? (parseFloat(localOrcamento.valor_total || '0') / parseFloat(localOrcamento.custo_total)).toFixed(2) + 'x'
                                        : '0.00x'}
                                </span>
                            </div>

                            <hr />

                            <div className="py-3">
                                <h6 className="small text-muted mb-2">VALOR TOTAL DA PROPOSTA</h6>
                                <div className="h2 fw-bold text-primary mb-0">
                                    R$ {parseFloat(localOrcamento.valor_total || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                            </div>

                            <div className="mt-4">
                                <Button variant="primary" className="w-100 py-3 fw-bold mb-3 shadow-sm d-flex justify-content-center align-items-center">
                                    <Calculator className="me-2" size={18} /> ATUALIZAR CÁLCULOS
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    className="w-100 py-2"
                                    onClick={() => window.open(`http://localhost:8000/orcamentos/pdf/${id}/`, '_blank')}
                                    disabled={!id}
                                >
                                    GERAR PREVIEW PDF
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

// Componente Interno de Busca
const ProductSearch: React.FC<{ onSelect: (p: Produto) => void }> = ({ onSelect }) => {
    const [search, setSearch] = useState('');
    const { data: results, isLoading } = useQuery<Produto[]>({
        queryKey: ['search-products', search],
        queryFn: () => produtoApi.search(search),
        enabled: search.length > 2
    });

    return (
        <div className="position-relative">
            <InputGroup size="sm">
                <InputGroup.Text><Search size={14} /></InputGroup.Text>
                <Form.Control
                    placeholder="Buscar produto por nome ou código..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </InputGroup>
            {results && results.length > 0 && (
                <ListGroup className="position-absolute w-100 shadow-lg z-index-1000 mt-1">
                    {results.map(p => (
                        <ListGroup.Item
                            key={p.id}
                            action
                            onClick={() => { onSelect(p); setSearch(''); }}
                            className="small d-flex justify-content-between"
                        >
                            <span>{p.codigo} - {p.descricao}</span>
                            <span className="text-success fw-bold">R$ {p.custo_base}</span>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </div>
    );
};


export default OrcamentoEditor;
