import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Row, Col, Card, Button, Form, Table, InputGroup, Badge, Spinner, ListGroup, Modal } from 'react-bootstrap';
import { ArrowLeft, Save, Plus, Trash2, Search, Calculator, Copy, Send, Compass, Filter } from 'lucide-react';
import { orcamentoApi } from '../api/orcamentos';
import { usuarioApi } from '../api/usuarios';
import { clienteApi } from '../api/clientes';
import { produtoApi, categoriaApi } from '../api/produtos';
import { fornecedorApi } from '../api/fornecedores';
import { Orcamento, Kit, ItemOrcamento, Cliente, Produto, ConfiguracaoPreco, User, Categoria, Fornecedor } from '../types';

// Hook personalizado para Debounce
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const OrcamentoEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();

    // Estado para o Modal de Busca
    const [showSearchModal, setShowModal] = useState(false);
    const [activeKitIndex, setActiveKitIndex] = useState<number | null>(null);

    // Captura parâmetros da URL (vindo do Kanban)
    const queryParams = new URLSearchParams(location.search);
    const urlOportunidade = queryParams.get('oportunidade');
    const urlCliente = queryParams.get('cliente');

    const [localOrcamento, setLocalOrcamento] = useState<Partial<Orcamento>>({
        status: 'RASCUNHO',
        margem_contrib: '0.2000',
        desconto_percent: '0.00',
        kits: [],
        oportunidade: urlOportunidade ? parseInt(urlOportunidade) : undefined,
        cliente: urlCliente ? parseInt(urlCliente) : undefined
    });

    const { data: config } = useQuery<ConfiguracaoPreco[]>({
        queryKey: ['config-preco'],
        queryFn: orcamentoApi.getConfig,
        staleTime: 1000 * 60 * 5, // 5 minutos
    });

    const { data: clientes } = useQuery<Cliente[]>({
        queryKey: ['clientes'],
        queryFn: clienteApi.list,
        staleTime: 1000 * 60 * 2, // 2 minutos
    });

    const { data: vendedores = [] } = useQuery({
        queryKey: ['vendedores'],
        queryFn: () => usuarioApi.list({ role: 'COMERCIAL' }),
        staleTime: 1000 * 60 * 10, // 10 minutos
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
            navigate('/orcamentos');
        },
        onError: (err: any) => {
            alert(`Erro ao salvar: ${err.response?.data ? JSON.stringify(err.response.data) : err.message}`);
        }
    });

    const revisionMutation = useMutation({
        mutationFn: () => orcamentoApi.createRevision(id!),
        onSuccess: (newOrc) => {
            queryClient.invalidateQueries({ queryKey: ['orcamentos'] });
            navigate(`/orcamento/${newOrc.id}`);
        },
        onError: (err: any) => {
            alert(`Erro ao criar revisão: ${err.message}`);
        }
    });

    useEffect(() => {
        if (remoteOrcamento) {
            setLocalOrcamento(remoteOrcamento);
        }
    }, [remoteOrcamento]);

    const performCalculation = useCallback((kits: Kit[], marginStr: string, discountStr: string) => {
        if (!config || config.length === 0) return;
        const activeConfig = config[0];
        const margin = parseFloat(marginStr || '0.2000');
        const discount = parseFloat(discountStr || '0') / 100;
        
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

        const updatedKits = kits.map(kit => {
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

        const finalVenda = totalVenda * (1 - discount);

        setLocalOrcamento(prev => ({
            ...prev,
            kits: updatedKits,
            custo_total: totalCusto.toFixed(2),
            valor_total: finalVenda.toFixed(2)
        }));
    }, [config]);

    const calculateTotals = () => {
        performCalculation(
            localOrcamento.kits || [], 
            localOrcamento.margem_contrib || '0.2000', 
            localOrcamento.desconto_percent || '0'
        );
    };

    const addKit = () => {
        const newKit: Kit = {
            nome: `Novo Kit ${(localOrcamento.kits?.length || 0) + 1}`,
            descricao: '',
            orcamento: id ? parseInt(id) : 0,
            ordem: (localOrcamento.kits?.length || 0) + 1,
            itens: []
        };
        const updatedKits = [...(localOrcamento.kits || []), newKit];
        setLocalOrcamento(prev => ({ ...prev, kits: updatedKits }));
    };

    const deleteKit = (index: number) => {
        if (window.confirm(`Tem certeza que deseja excluir o kit "${localOrcamento.kits![index].nome}" e todos os seus materiais?`)) {
            const updatedKits = (localOrcamento.kits || []).filter((_, i) => i !== index);
            performCalculation(updatedKits, localOrcamento.margem_contrib || '0.2000', localOrcamento.desconto_percent || '0');
        }
    };

    const deleteItem = (kitIndex: number, itemIndex: number) => {
        if (window.confirm("Remover este material do kit?")) {
            const updatedKits = [...(localOrcamento.kits || [])];
            const updatedItens = updatedKits[kitIndex].itens.filter((_, i) => i !== itemIndex);
            updatedKits[kitIndex] = { ...updatedKits[kitIndex], itens: updatedItens };
            performCalculation(updatedKits, localOrcamento.margem_contrib || '0.2000', localOrcamento.desconto_percent || '0');
        }
    };

    const addItemToKit = (produto: Produto) => {
        if (activeKitIndex === null) return;

        const newItem: ItemOrcamento = {
            kit: 0,
            produto: produto.id,
            codigo: produto.codigo,
            descricao: produto.descricao,
            quantidade: '1',
            custo_unit_snapshot: produto.custo_base,
            vlr_unit_venda: '0',
            desconto_unit_valor: '0',
            desconto_percent_item: '0'
        };

        const updatedKits = [...(localOrcamento.kits || [])];
        updatedKits[activeKitIndex] = {
            ...updatedKits[activeKitIndex],
            itens: [...updatedKits[activeKitIndex].itens, newItem]
        };
        
        performCalculation(updatedKits, localOrcamento.margem_contrib || '0.2000', localOrcamento.desconto_percent || '0');
        setShowModal(false);
    };

    const handleFinalize = () => {
        if (!id) {
            alert("Salve o orçamento primeiro antes de finalizar.");
            return;
        }

        const valorTotal = parseFloat(localOrcamento.valor_total || '0');
        if (valorTotal <= 0) {
            alert("Não é possível enviar um orçamento com valor zerado. Adicione kits e materiais primeiro.");
            return;
        }

        if (window.confirm("Deseja finalizar este orçamento e enviar para o Comercial? Isso liberará o card no Kanban.")) {
            saveMutation.mutate({ ...localOrcamento, status: 'ENVIADO' });
        }
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
                <div className="d-flex align-items-center gap-2">
                    {id && (
                        <>
                            <Button
                                variant="outline-primary"
                                className="d-flex align-items-center"
                                onClick={() => revisionMutation.mutate()}
                                disabled={revisionMutation.isPending}
                            >
                                <Copy size={18} className="me-2" />
                                {revisionMutation.isPending ? 'Criando...' : 'Nova Revisão'}
                            </Button>
                            <Button
                                variant="outline-success"
                                className="d-flex align-items-center"
                                onClick={handleFinalize}
                                disabled={saveMutation.isPending}
                            >
                                <Send size={18} className="me-2" />
                                Finalizar e Enviar
                            </Button>
                        </>
                    )}
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
                                        <Form.Label className="fw-bold small">Cliente</Form.Label>
                                        <Form.Select
                                            className="text-dark"
                                            value={localOrcamento.cliente || ''}
                                            onChange={(e) => setLocalOrcamento({ ...localOrcamento, cliente: parseInt(e.target.value) })}
                                        >
                                            <option value="" className="text-dark">Selecione o Cliente</option>
                                            {clientes?.map(c => <option key={c.id} value={c.id} className="text-dark">{c.razao_social}</option>)}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold small">Vendedor Responsável</Form.Label>
                                        <Form.Select
                                            className="text-dark"
                                            value={localOrcamento.vendedor || ''}
                                            onChange={(e) => setLocalOrcamento({ ...localOrcamento, vendedor: e.target.value ? parseInt(e.target.value) : null })}
                                        >
                                            <option value="" className="text-dark">Selecione o Vendedor</option>
                                            {vendedores.map((v: User) => (
                                                <option key={v.id} value={v.id} className="text-dark">{v.first_name} {v.last_name}</option>
                                            ))}
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
                                                const newMargin = (parseFloat(e.target.value) / 100).toString();
                                                setLocalOrcamento(prev => ({ ...prev, margem_contrib: newMargin }));
                                                performCalculation(localOrcamento.kits || [], newMargin, localOrcamento.desconto_percent || '0');
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
                                <Form.Control
                                    className="border-0 fw-bold text-primary p-0 shadow-none fs-6 bg-transparent"
                                    value={kit.nome}
                                    onChange={(e) => {
                                        const updatedKits = [...(localOrcamento.kits || [])];
                                        updatedKits[kIdx] = { ...updatedKits[kIdx], nome: e.target.value };
                                        setLocalOrcamento(prev => ({ ...prev, kits: updatedKits }));
                                    }}
                                    style={{ width: 'auto', minWidth: '200px' }}
                                />
                                <Button variant="outline-danger" size="sm" onClick={() => deleteKit(kIdx)}>
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
                                            <th className="text-end pe-4">Ações</th>
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
                                                            const updatedKits = [...(localOrcamento.kits || [])];
                                                            const updatedItens = [...updatedKits[kIdx].itens];
                                                            updatedItens[iIdx] = { ...updatedItens[iIdx], quantidade: e.target.value };
                                                            updatedKits[kIdx] = { ...updatedKits[kIdx], itens: updatedItens };
                                                            performCalculation(updatedKits, localOrcamento.margem_contrib || '0.2000', localOrcamento.desconto_percent || '0');
                                                        }}
                                                    />
                                                </td>
                                                <td>R$ {parseFloat(item.custo_unit_snapshot).toFixed(2)}</td>
                                                <td className="fw-bold text-success">R$ {parseFloat(item.vlr_unit_venda).toFixed(2)}</td>
                                                <td className="text-end pe-4">
                                                    <Button variant="link" className="text-danger p-0" onClick={() => deleteItem(kIdx, iIdx)}>
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td colSpan={5} className="p-3 bg-light text-center">
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm" 
                                                    className="d-inline-flex align-items-center"
                                                    onClick={() => {
                                                        setActiveKitIndex(kIdx);
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    <Compass size={16} className="me-2" /> Buscar Material no Banco
                                                </Button>
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
                                <Button variant="primary" className="w-100 py-3 fw-bold mb-3 shadow-sm d-flex justify-content-center align-items-center" onClick={calculateTotals}>
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

            {/* Modal de Busca de Produtos */}
            <ProductSearchModal 
                show={showSearchModal} 
                onHide={() => setShowModal(false)} 
                onSelect={addItemToKit} 
            />

            <style>{`
                .form-select, .form-control, option {
                    color: #212529 !important;
                    background-color: #fff !important;
                }
                select.form-select option {
                    color: #000 !important;
                }
            `}</style>
        </div>
    );
};

// Componente Modal de Busca
const ProductSearchModal: React.FC<{ show: boolean, onHide: () => void, onSelect: (p: Produto) => void }> = ({ show, onHide, onSelect }) => {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500); // 500ms de atraso
    
    const [selCategoria, setSelCategoria] = useState<number | undefined>(undefined);
    const [selFornecedor, setSelFornecedor] = useState<number | undefined>(undefined);

    const { data: categorias = [] } = useQuery({ 
        queryKey: ['categorias'], 
        queryFn: categoriaApi.list, 
        enabled: show,
        staleTime: 1000 * 60 * 30 // 30 minutos
    });
    
    const { data: fornecedores = [] } = useQuery({ 
        queryKey: ['fornecedores'], 
        queryFn: fornecedorApi.list, 
        enabled: show,
        staleTime: 1000 * 60 * 30 // 30 minutos
    });

    const { data: results, isLoading } = useQuery<Produto[]>({
        queryKey: ['search-products', debouncedSearch, selCategoria, selFornecedor],
        queryFn: () => produtoApi.search(debouncedSearch, { categoria: selCategoria, fornecedor: selFornecedor }),
        enabled: show && (debouncedSearch.length > 0 || !!selCategoria || !!selFornecedor)
    });

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="modal-premium">
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="fw-bold d-flex align-items-center">
                    <Compass size={24} className="text-primary me-2" />
                    Buscar Materiais
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Row className="g-3 mb-4">
                    <Col md={12}>
                        <InputGroup className="shadow-sm">
                            <InputGroup.Text className="bg-white border-end-0">
                                <Search size={20} className="text-muted" />
                            </InputGroup.Text>
                            <Form.Control
                                size="lg"
                                className="border-start-0 ps-0 text-dark"
                                placeholder="Digite o código ou descrição do material..."
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </InputGroup>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="small fw-bold text-muted d-flex align-items-center">
                                <Filter size={14} className="me-1" /> Categoria
                            </Form.Label>
                            <Form.Select 
                                className="text-dark" 
                                value={selCategoria || ''} 
                                onChange={(e) => setSelCategoria(e.target.value ? parseInt(e.target.value) : undefined)}
                            >
                                <option value="">Todas as Categorias</option>
                                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="small fw-bold text-muted d-flex align-items-center">
                                <Compass size={14} className="me-1" /> Fabricante
                            </Form.Label>
                            <Form.Select 
                                className="text-dark" 
                                value={selFornecedor || ''} 
                                onChange={(e) => setSelFornecedor(e.target.value ? parseInt(e.target.value) : undefined)}
                            >
                                <option value="">Todos os Fabricantes</option>
                                {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome_fantasia || f.razao_social}</option>)}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {isLoading ? (
                        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                    ) : (
                        <ListGroup variant="flush">
                            {results && results.length > 0 ? (
                                results.map(p => (
                                    <ListGroup.Item
                                        key={p.id}
                                        action
                                        onClick={() => { onSelect(p); setSearch(''); }}
                                        className="d-flex justify-content-between align-items-center py-3 border-bottom text-dark"
                                    >
                                        <div>
                                            <div className="fw-bold text-primary">{p.codigo}</div>
                                            <div className="text-dark small fw-medium">{p.descricao}</div>
                                            <div className="d-flex gap-2 mt-1">
                                                {p.fornecedor_nome && <Badge bg="info" className="x-small">Fab: {p.fornecedor_nome}</Badge>}
                                                {p.ncm && <Badge bg="light" text="dark" className="border font-monospace x-small">NCM: {p.ncm}</Badge>}
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div className="fw-bold text-success">R$ {parseFloat(p.custo_base).toFixed(2)}</div>
                                            <div className="text-muted x-small">Custo Base</div>
                                        </div>
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    {(search.length > 0 || selCategoria || selFornecedor) ? 'Nenhum material encontrado para estes filtros.' : 'Comece a digitar ou selecione um filtro para buscar...'}
                                </div>
                            )}
                        </ListGroup>
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
};


export default OrcamentoEditor;
