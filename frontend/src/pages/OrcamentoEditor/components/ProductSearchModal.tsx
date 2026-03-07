import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, InputGroup, Form, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { Search, Filter, Compass, Layers } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { produtoApi, categoriaApi } from '../../../api/produtos';
import { fornecedorApi } from '../../../api/fornecedores';
import { Produto } from '../../../types';

// Hook personalizado de Debounce interno para o componente de busca
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

interface ProductSearchModalProps {
    show: boolean;
    onHide: () => void;
    onSelect: (p: Produto) => void;
}

const ProductSearchModal: React.FC<ProductSearchModalProps> = ({ show, onHide, onSelect }) => {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);

    const [selCategoria, setSelCategoria] = useState<number | undefined>(undefined);
    const [selFornecedor, setSelFornecedor] = useState<number | undefined>(undefined);

    const { data: categorias = [] } = useQuery({
        queryKey: ['categorias'],
        queryFn: categoriaApi.list,
        enabled: show,
        staleTime: 1000 * 60 * 30
    });

    const { data: fornecedores = [] } = useQuery({
        queryKey: ['fornecedores'],
        queryFn: fornecedorApi.list,
        enabled: show,
        staleTime: 1000 * 60 * 30
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
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0"><Layers size={18} className="text-muted" /></InputGroup.Text>
                                <Form.Select
                                    className="text-dark border-start-0"
                                    value={selCategoria || ''}
                                    onChange={(e) => setSelCategoria(e.target.value ? parseInt(e.target.value) : undefined)}
                                >
                                    <option value="">Todas as Categorias</option>
                                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                </Form.Select>
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="small fw-bold text-muted d-flex align-items-center">
                                <Compass size={14} className="me-1" /> Fabricante
                            </Form.Label>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0"><Compass size={18} className="text-muted" /></InputGroup.Text>
                                <Form.Select
                                    className="text-dark border-start-0"
                                    value={selFornecedor || ''}
                                    onChange={(e) => setSelFornecedor(e.target.value ? parseInt(e.target.value) : undefined)}
                                >
                                    <option value="">Todos os Fabricantes</option>
                                    {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome_fantasia || f.razao_social}</option>)}
                                </Form.Select>
                            </InputGroup>
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

export default ProductSearchModal;
