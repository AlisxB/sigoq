import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Card, Spinner } from 'react-bootstrap';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface GenericCRUDProps<T> {
    title: string;
    entityName: string;
    queryKey: string;
    api: {
        list: () => Promise<T[]>;
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
    renderFilters
}: GenericCRUDProps<T>) => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingItem, setEditingItem] = useState<T | null>(null);
    const [itemToDelete, setItemToDelete] = useState<number | string | null>(null);
    const [formData, setFormData] = useState<Partial<T>>(initialData);

    const { data: items = [], isLoading } = useQuery({
        queryKey: [queryKey],
        queryFn: api.list
    });

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
        const matchesSearch = Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesCustom = filterFn ? filterFn(item) : true;
        return matchesSearch && matchesCustom;
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
                            <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '400px' }}>
                                <Form.Label className="form-premium-label">Pesquisar</Form.Label>
                                <div style={{ position: 'relative' }}>
                                    <Search size={18} color="#7C8FAC" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                                    <Form.Control
                                        placeholder={`Buscar ${entityName.toLowerCase()}...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="form-control-premium ps-5"
                                    />
                                </div>
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
                                    filteredItems.map((item) => (
                                        <tr key={item.id}>
                                            {columns.map((col, idx) => (
                                                <td key={idx} className="px-4 py-3 border-0 fw-medium">
                                                    {typeof col.accessor === 'function'
                                                        ? col.accessor(item)
                                                        : (item[col.accessor] as any)}
                                                </td>
                                            ))}
                                            <td className="px-4 py-3 border-0 text-end">
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="me-2 text-primary"
                                                    style={{ borderRadius: '8px' }}
                                                    onClick={() => handleOpen(item)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="text-danger"
                                                    style={{ borderRadius: '8px' }}
                                                    onClick={() => item.id && handleDeleteClick(item.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
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
