import React, { useState } from 'react';
import { Table, Button, Card, Form, Modal, Spinner } from 'react-bootstrap';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
}

interface GenericCRUDProps<T> {
    title: string;
    entityName: string;
    api: {
        list: () => Promise<T[]>;
        create: (data: Partial<T>) => Promise<T>;
        update: (id: number | string, data: Partial<T>) => Promise<T>;
        delete: (id: number | string) => Promise<void>;
    };
    columns: Column<T>[];
    renderForm: (data: Partial<T>, onChange: (field: keyof T, value: any) => void) => React.ReactNode;
    initialData: Partial<T>;
    queryKey: string;
}

const GenericCRUD = <T extends { id: number | string }>({
    title,
    entityName,
    api,
    columns,
    renderForm,
    initialData,
    queryKey
}: GenericCRUDProps<T>) => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<T> | null>(null);
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

    const confirmDelete = (id: number | string) => {
        if (window.confirm(`Tem certeza que deseja excluir este ${entityName}?`)) {
            deleteMutation.mutate(id);
        }
    };

    const filteredItems = items.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold" style={{ color: '#2A3547' }}>{title}</h2>
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
                    <div className="p-4 border-bottom">
                        <div style={{ position: 'relative', maxWidth: '400px' }}>
                            <Search size={18} color="#7C8FAC" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                            <Form.Control
                                placeholder={`Pesquisar ${entityName.toLowerCase()}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    paddingLeft: '45px',
                                    borderRadius: '12px',
                                    border: '1px solid #DFE5EF',
                                    backgroundColor: '#F8F9FA'
                                }}
                            />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <Table hover className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    {columns.map((col, idx) => (
                                        <th key={idx} className="border-0 px-4 py-3" style={{ fontSize: '13px', color: '#5A6A83', fontWeight: '600' }}>
                                            {col.header}
                                        </th>
                                    ))}
                                    <th className="border-0 px-4 py-3 text-end" style={{ fontSize: '13px', color: '#5A6A83', fontWeight: '600' }}>
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={columns.length + 1} className="text-center py-5">
                                            <Spinner animation="border" variant="primary" size="sm" />
                                        </td>
                                    </tr>
                                ) : filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length + 1} className="text-center py-5 text-muted">
                                            Nenhum {entityName.toLowerCase()} encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map(item => (
                                        <tr key={item.id}>
                                            {columns.map((col, idx) => (
                                                <td key={idx} className="px-4 py-3" style={{ fontSize: '14px', color: '#2A3547' }}>
                                                    {typeof col.accessor === 'function' ? col.accessor(item) : (item[col.accessor] as any)}
                                                </td>
                                            ))}
                                            <td className="px-4 py-3 text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button variant="light" size="sm" onClick={() => handleOpen(item as T)} style={{ borderRadius: '8px', color: '#5D87FF' }}>
                                                        <Edit2 size={16} />
                                                    </Button>
                                                    <Button variant="light" size="sm" onClick={() => confirmDelete(item.id)} style={{ borderRadius: '8px', color: '#FA896B' }}>
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={handleClose} centered size="lg" style={{ borderRadius: '20px' }}>
                <Modal.Header closeButton className="border-0 p-4">
                    <Modal.Title className="fw-bold">{editingItem ? `Editar ${entityName}` : `Novo ${entityName}`}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="p-4 pt-0">
                        {renderForm(formData, handleChange)}
                    </Modal.Body>
                    <Modal.Footer className="border-0 p-4 pt-0">
                        <Button variant="light" onClick={handleClose} style={{ borderRadius: '10px' }}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending || updateMutation.isPending}
                            style={{ backgroundColor: '#5D87FF', border: 'none', borderRadius: '10px' }}
                        >
                            {(createMutation.isPending || updateMutation.isPending) ? (
                                <Spinner animation="border" size="sm" />
                            ) : 'Salvar Alterações'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default GenericCRUD;
