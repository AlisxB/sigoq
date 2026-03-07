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
            <Modal.Header closeButton className="border-0 px-4 pt-4">
                <Modal.Title className="fw-bold d-flex align-items-center" style={{ color: 'var(--text-primary)' }}>
                    <div className="bg-primary-light p-2 rounded-12 me-3 text-primary">
                        <Compass size={24} />
                    </div>
                    Catálogo de Materiais
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <Row className="g-3 mb-4">
                    <Col md={12}>
                        <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                            <InputGroup.Text className="bg-white border-0 ps-3">
                                <Search size={20} className="text-muted" />
                            </InputGroup.Text>
                            <Form.Control
                                size="lg"
                                className="border-0 shadow-none ps-0 text-dark"
                                placeholder="Código ou descrição..."
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ fontSize: '1rem' }}
                            />
                        </InputGroup>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="small fw-bold text-muted d-flex align-items-center">
                                <Filter size={14} className="me-1" /> Categoria
                            </Form.Label>
                            <InputGroup className="rounded-12 overflow-hidden border">
                                <InputGroup.Text className="bg-light border-0"><Layers size={18} className="text-muted" /></InputGroup.Text>
                                <Form.Select
                                    className="text-dark border-0 shadow-none bg-light"
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
                            <InputGroup className="rounded-12 overflow-hidden border">
                                <InputGroup.Text className="bg-light border-0"><Compass size={18} className="text-muted" /></InputGroup.Text>
                                <Form.Select
                                    className="text-dark border-0 shadow-none bg-light"
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

                <div className="rounded-12 border overflow-hidden shadow-inner bg-white" style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
                                        className="d-flex justify-content-between align-items-center py-3 px-4 border-bottom text-dark hover-bg-light"
                                    >
                                        <div>
                                            <div className="fw-bold text-primary" style={{ letterSpacing: '0.5px' }}>{p.codigo}</div>
                                            <div className="text-dark small fw-medium">{p.descricao}</div>
                                            <div className="d-flex gap-2 mt-2">
                                                {p.fornecedor_nome && <Badge bg="info" className="rounded-pill px-2 py-1 x-small fw-bold" style={{ backgroundColor: 'rgba(73, 190, 255, 0.1)', color: '#49BEFF', border: 'none' }}>{p.fornecedor_nome}</Badge>}
                                                {p.ncm && <Badge bg="light" text="dark" className="border font-monospace x-small rounded-pill px-2">NCM: {p.ncm}</Badge>}
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div className="fw-extrabold" style={{ color: 'var(--success)', fontSize: '1.1rem' }}>R$ {parseFloat(p.custo_base).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                            <div className="text-muted x-small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Custo Base</div>
                                        </div>
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <div className="text-center py-5 text-muted px-4">
                                    <div className="opacity-20 mb-3"><Search size={48} /></div>
                                    {(search.length > 0 || selCategoria || selFornecedor) ? 
                                        <p className="mb-0">Nenhum material encontrado para estes filtros.</p> : 
                                        <p className="mb-0">Utilize a busca ou os filtros para encontrar materiais.</p>
                                    }
                                </div>
                            )}
                        </ListGroup>
                    )}
                </div>
            </Modal.Body>
            <style>{`
                .bg-primary-light { background-color: rgba(93, 135, 255, 0.1); }
                .hover-bg-light:hover { background-color: rgba(93, 135, 255, 0.05) !important; }
                .rounded-12 { border-radius: 12px !important; }
                .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02); }
            `}</style>
        </Modal>
    );
};

export default ProductSearchModal;
