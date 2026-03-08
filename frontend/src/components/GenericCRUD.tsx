import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Card, Spinner, InputGroup } from 'react-bootstrap';
import { Plus, Edit, Trash2, Search, ChevronDown } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface GenericCRUDProps<T> {
    title: string;
    entityName: string;
    queryKey: string;
    api: {
        list: (params?: any) => Promise<any>;
        create: (item: Partial<T>) => Promise<T>;
        update: (id: number | string, item: Partial<T>) => Promise<T>;
        delete: (id: number | string) => Promise<void>;
    };
    columns: {
        header: string;
        accessor: keyof T | ((item: T) => React.ReactNode);
    }[];
    initialData: Partial<T>;
    renderForm: (formData: Partial<T>, handleChange: (field: keyof T, value: any) => void) => React.ReactNode;
    filterFn?: (item: T) => boolean;
    renderFilters?: () => React.ReactNode;
    useInfinite?: boolean; // Se verdadeiro, habilita o botão "Carregar Mais"
    extraParams?: any;     // Parâmetros extras para a busca no servidor
}

const GenericCRUD = <T extends { id?: number | string }>({
    title,
    entityName,
    queryKey,
    api,
    columns,
    initialData,
    renderForm,
    filterFn,
    renderFilters,
    useInfinite = false,
    extraParams = {}
}: GenericCRUDProps<T>) => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);
    const [itemToDelete, setItemToDelete] = useState<number | string | null>(null);
    const [formData, setFormData] = useState<Partial<T>>(initialData);

    // Query para o modo Infinito
    const infiniteQuery = useInfiniteQuery({
        queryKey: [queryKey, 'infinite', searchTerm, extraParams],
        queryFn: ({ pageParam = 1 }) => api.list({ 
            page: pageParam, 
            search: searchTerm,
            ...extraParams 
        }),
        getNextPageParam: (lastPage) => {
            if (lastPage.next) {
                try {
                    const url = new URL(lastPage.next);
                    return parseInt(url.searchParams.get('page') || '1');
                } catch (e) {
                    // Fallback se a URL for relativa
                    const match = lastPage.next.match(/page=(\d+)/);
                    return match ? parseInt(match[1]) : undefined;
                }
            }
            return undefined;
        },
        initialPageParam: 1,
        enabled: useInfinite
    });

    // Query para o modo Normal (Legado/Simples)
    const normalQuery = useQuery({
        queryKey: [queryKey, searchTerm, extraParams],
        queryFn: () => api.list({ search: searchTerm, ...extraParams }),
        enabled: !useInfinite
    });

    // Consolidação dos itens
    const items = useMemo(() => {
        if (useInfinite) {
            return infiniteQuery.data?.pages.flatMap(page => {
                if (Array.isArray(page)) return page;
                return page.results || [];
            }) || [];
        }
        const data = normalQuery.data;
        if (Array.isArray(data)) return data;
        if (data?.results) return data.results;
        return [];
    }, [useInfinite, infiniteQuery.data, normalQuery.data]);

    const isLoading = useInfinite ? infiniteQuery.isLoading : normalQuery.isLoading;

    const createMutation = useMutation({
        mutationFn: api.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            handleClose();
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: { id: number | string, item: Partial<T> }) => api.update(data.id, data.item),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            handleClose();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: api.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    });

    const handleOpen = (item?: T) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData(initialData);
        }
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData(initialData);
    };

    const handleChange = (field: keyof T, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem?.id) {
            updateMutation.mutate({ id: editingItem.id, item: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleDeleteClick = (id: number | string) => {
        setItemToDelete(id);
        setShowDeleteModal(true);
    };

    const filteredItems = items.filter(item => {
        // Busca simplificada local para filtros customizados que não estão no servidor
        const matchesCustom = filterFn ? filterFn(item) : true;
        return matchesCustom;
    });

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h4 fw-extrabold mb-1" style={{ color: '#2A3547', letterSpacing: '-0.5px' }}>{title}</h1>
                    <p className="text-muted small mb-0">Gerencie seus {entityName.toLowerCase()}s de forma simples e rápida.</p>
                </div>
                <Button
                    onClick={() => handleOpen()}
                    style={{ backgroundColor: '#5D87FF', border: 'none', borderRadius: '10px', padding: '10px 20px' }}
                    className="d-flex align-items-center gap-2 shadow-sm"
                >
                    <Plus size={18} /> Novo {entityName}
                </Button>
            </div>

            <Card style={{ borderRadius: '20px', border: 'none', boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.02)' }}>
                <Card.Body className="p-0">
                    <div className="p-4 border-bottom bg-light bg-opacity-10">
                        <div className="d-flex flex-wrap align-items-end gap-3">
                            <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
                                <Form.Label className="form-premium-label">Pesquisar</Form.Label>
                                <InputGroup className="shadow-sm rounded-12 overflow-hidden border">
                                    <InputGroup.Text className="bg-white border-0 ps-3">
                                        <Search size={18} className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        placeholder={`Buscar ${entityName.toLowerCase()} por qualquer campo...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="border-0 shadow-none py-2"
                                    />
                                </InputGroup>
                            </div>
                            {renderFilters?.()}
                        </div>
                    </div>

                    <div className="table-responsive">
                        <Table hover className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    {columns.map((col, idx) => (
                                        <th key={idx} className="border-0 px-4 py-3 text-muted small fw-bold uppercase">{col.header}</th>
                                    ))}
                                    <th className="border-0 px-4 py-3 text-end text-muted small fw-bold">AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={columns.length + 1} className="text-center py-5">
                                            <Spinner animation="border" variant="primary" />
                                        </td>
                                    </tr>
                                ) : filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length + 1} className="text-center py-5 text-muted">
                                            Nenhum {entityName.toLowerCase()} encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {filteredItems.map((item) => (
                                            <tr key={item.id}>
                                                {columns.map((col, idx) => (
                                                    <td key={idx} className="px-4 py-3 border-0 fw-medium">
                                                        {typeof col.accessor === 'function'
                                                            ? col.accessor(item)
                                                            : (item[col.accessor] as any)}
                                                    </td>
                                                ))}
                                                <td className="px-4 py-3 border-0">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <Button
                                                            variant="light"
                                                            size="sm"
                                                            className="text-primary border-0"
                                                            style={{ borderRadius: '8px', padding: '8px' }}
                                                            onClick={() => handleOpen(item)}
                                                            title="Editar"
                                                        >
                                                            <Edit size={16} />
                                                        </Button>
                                                        <Button
                                                            variant="light"
                                                            size="sm"
                                                            className="text-danger border-0"
                                                            style={{ borderRadius: '8px', padding: '8px' }}
                                                            onClick={() => item.id && handleDeleteClick(item.id)}
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                )}
                            </tbody>
                        </Table>
                    </div>

                    {useInfinite && infiniteQuery.hasNextPage && (
                        <div className="p-4 border-top text-center bg-light bg-opacity-10">
                            <Button 
                                variant="outline-primary" 
                                className="rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2"
                                onClick={() => infiniteQuery.fetchNextPage()}
                                disabled={infiniteQuery.isFetchingNextPage}
                            >
                                {infiniteQuery.isFetchingNextPage ? (
                                    <Spinner animation="border" size="sm" />
                                ) : (
                                    <ChevronDown size={18} />
                                )}
                                CARREGAR MAIS {entityName.toUpperCase()}S
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleClose} centered size="lg">
                <Modal.Header closeButton className="border-0 p-4">
                    <Modal.Title className="fw-bold">{editingItem ? `Editar ${entityName}` : `Novo ${entityName}`}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="p-4 pt-0">
                        {renderForm(formData, handleChange)}
                    </Modal.Body>
                    <Modal.Footer className="border-0 p-4">
                        <Button variant="light" onClick={handleClose} style={{ borderRadius: '10px' }}>
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            style={{ borderRadius: '10px' }}
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {editingItem ? 'Salvar Alterações' : 'Criar Registro'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <ConfirmModal
                show={showDeleteModal}
                title={`Excluir ${entityName}`}
                message={`Tem certeza que deseja excluir este ${entityName.toLowerCase()}? Esta ação não pode ser desfeita.`}
                onConfirm={() => itemToDelete && deleteMutation.mutate(itemToDelete)}
                onCancel={() => setShowDeleteModal(false)}
                confirmLabel="Excluir"
                cancelLabel="Cancelar"
            />
        </div>
    );
};

export default GenericCRUD;
