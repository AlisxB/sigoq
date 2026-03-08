import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, InputGroup, Form, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { Search, Filter, Compass, Layers } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { produtoApi, categoriaApi } from '../../../api/produtos';
import { fornecedorApi } from '../../../api/fornecedores';
import { Produto, Categoria, Fornecedor } from '../../../types';
import Autocomplete from '../../../components/Autocomplete';

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
    const debouncedSearch = useDebounce(search, 600);

    const [selCategoria, setSelCategoria] = useState<number | string | undefined>(undefined);
    const [selFornecedor, setSelFornecedor] = useState<number | string | undefined>(undefined);

    const { data: categorias = [] } = useQuery<Categoria[]>({
        queryKey: ['categorias'],
        queryFn: categoriaApi.list,
        enabled: show,
        staleTime: 1000 * 60 * 60 // 1 hora de cache para categorias
    });

    const { data: fornecedores = [] } = useQuery<Fornecedor[]>({
        queryKey: ['fornecedores'],
        queryFn: fornecedorApi.list,
        enabled: show,
        staleTime: 1000 * 60 * 60 // 1 hora de cache para fornecedores
    });

    const isSearchActive = debouncedSearch.length >= 2 || !!selCategoria || !!selFornecedor;

    const { data: results, isLoading } = useQuery<Produto[]>({
        queryKey: ['search-products', debouncedSearch, selCategoria, selFornecedor],
        queryFn: async () => {
            const catId = typeof selCategoria === 'string' ? parseInt(selCategoria) : selCategoria;
            const forId = typeof selFornecedor === 'string' ? parseInt(selFornecedor) : selFornecedor;

            if (isSearchActive) {
                return produtoApi.search(debouncedSearch, { categoria: catId, fornecedor: forId });
            }
            // Carrega os primeiros materiais para "aquecer" o banco e a interface
            const response = await produtoApi.list();
            return Array.isArray(response) ? response : (response.results || []);
        },
        enabled: show,
        staleTime: 1000 * 60 * 5, // 5 minutos de cache para resultados de busca
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
                        <Autocomplete
                            placeholder="Todas as Categorias"
                            options={categorias.map(c => ({ id: c.id, label: c.nome }))}
                            value={selCategoria}
                            onChange={setSelCategoria}
                            icon={<Layers size={18} className="text-muted" />}
                        />
                    </Col>
                    <Col md={6}>
                        <Autocomplete
                            placeholder="Todos os Fabricantes"
                            options={fornecedores.map(f => ({ id: f.id, label: f.nome_fantasia || f.razao_social }))}
                            value={selFornecedor}
                            onChange={setSelFornecedor}
                            icon={<Compass size={18} className="text-muted" />}
                        />
                    </Col>
                </Row>

                <div className="rounded-12 border overflow-hidden shadow-inner bg-white" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {isLoading ? (
                        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                    ) : (
                        <ListGroup variant="flush">
                            {results && results.length > 0 ? (
                                <>
                                    {!isSearchActive && (
                                        <div className="bg-light px-4 py-2 border-bottom text-muted x-small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>
                                            Materiais sugeridos (digite para filtrar)
                                        </div>
                                    )}
                                    {results.map(p => (
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
                                    ))}
                                </>
                            ) : (
                                <div className="text-center py-5 text-muted px-4">
                                    <div className="opacity-20 mb-3"><Search size={48} /></div>
                                    <p className="mb-0">Nenhum material encontrado para estes filtros.</p>
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
