import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Row, Col, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Plus, Search, Users } from 'lucide-react';
import { usuarioApi } from '../../api/usuarios';
import UserCard from './components/UserCard';
import UserFormModal from './components/UserFormModal';
import { User } from '../../types';

const Usuarios: React.FC = () => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const { data: users = [], isLoading } = useQuery<User[]>({
        queryKey: ['usuarios'],
        queryFn: () => usuarioApi.list()
    });

    const saveMutation = useMutation({
        mutationFn: (data: any) => selectedUser 
            ? usuarioApi.update(selectedUser.id, data) 
            : usuarioApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['usuarios'] });
            setShowModal(false);
            setSelectedUser(null);
        },
        onError: (err: any) => {
            alert(`Erro ao salvar: ${err.response?.data ? JSON.stringify(err.response.data) : err.message}`);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => usuarioApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['usuarios'] });
        }
    });

    const filteredUsers = users.filter(u => 
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.role?.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleDelete = (user: User) => {
        if (window.confirm(`Deseja realmente remover o acesso de ${user.full_name}?`)) {
            deleteMutation.mutate(user.id);
        }
    };

    const handleResetPassword = async (user: User) => {
        try {
            await usuarioApi.resetPassword(user.id);
            alert(`Uma nova senha temporária foi gerada para ${user.username}.`);
        } catch (err) {
            alert('Erro ao resetar senha. Verifique as permissões.');
        }
    };

    const handleAdd = () => {
        setSelectedUser(null);
        setShowModal(true);
    };

    if (isLoading) return (
        <div className="text-center py-5 mt-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted fw-medium">Carregando equipe SIGOQ...</p>
        </div>
    );

    return (
        <div className="pb-5">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h1 className="h3 fw-extrabold mb-1" style={{ color: '#2A3547', letterSpacing: '-0.5px' }}>
                        Gestão da Equipe
                    </h1>
                    <p className="text-muted small mb-0">Controle de acesso e perfis de colaboradores</p>
                </div>
                <Button variant="primary" className="d-flex align-items-center shadow-sm px-4 py-2 fw-bold" onClick={handleAdd}>
                    <Plus size={20} className="me-2" /> Novo Usuário
                </Button>
            </div>

            {/* Search & Stats Bar */}
            <Row className="mb-4 align-items-center">
                <Col md={6}>
                    <InputGroup className="shadow-sm border-0" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                        <InputGroup.Text className="bg-white border-0 ps-3">
                            <Search size={18} className="text-muted" />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Buscar por nome, cargo ou usuário..."
                            className="border-0 py-2 ps-2"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col md={6} className="text-end">
                    <div className="d-inline-flex align-items-center bg-light px-3 py-2 rounded-pill border shadow-xs">
                        <Users size={16} className="text-primary me-2" />
                        <span className="small fw-bold text-dark">
                            {filteredUsers.length} {filteredUsers.length === 1 ? 'Membro' : 'Membros'}
                        </span>
                    </div>
                </Col>
            </Row>

            {/* User Grid */}
            {filteredUsers.length > 0 ? (
                <Row rowCols={1} rowColsMd={2} rowColsLg={3} className="g-4">
                    {filteredUsers.map(user => (
                        <Col key={user.id}>
                            <UserCard 
                                user={user}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onResetPassword={handleResetPassword}
                            />
                        </Col>
                    ))}
                </Row>
            ) : (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm border border-dashed mt-4">
                    <Users size={48} className="text-muted mb-3 opacity-25" />
                    <h5 className="text-dark fw-bold">Nenhum membro encontrado</h5>
                    <p className="text-muted small">Tente ajustar seus filtros de busca.</p>
                </div>
            )}

            {/* Form Modal */}
            <UserFormModal 
                show={showModal}
                onHide={() => setShowModal(false)}
                user={selectedUser}
                onSave={(data) => saveMutation.mutate(data)}
                isSaving={saveMutation.isPending}
            />
        </div>
    );
};

export default Usuarios;
