import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { User, Mail, Phone, Edit3, Trash2, Key, Github, Twitter, Facebook } from 'lucide-react';
import { User as UserType } from '../../../types';

interface UserCardProps {
    user: UserType;
    onEdit: (user: UserType) => void;
    onDelete: (user: UserType) => void;
    onResetPassword: (user: UserType) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete, onResetPassword }) => {
    // Iniciais para avatar caso não tenha URL
    const initials = user.full_name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <Card className="h-100 border-0 shadow-sm text-center user-card-hover" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <Card.Body className="pt-5 pb-4 px-4">
                {/* Avatar Section */}
                <div className="d-inline-flex align-items-center justify-content-center mb-4 position-relative">
                    {user.avatar_url ? (
                        <img 
                            src={user.avatar_url} 
                            alt={user.full_name} 
                            className="rounded-circle shadow-sm border border-2 border-white"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                    ) : (
                        <div 
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
                            style={{ width: '100px', height: '100px', fontSize: '2rem' }}
                        >
                            {initials}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <h5 className="fw-bold mb-1 text-dark">{user.full_name}</h5>
                <p className="text-muted small mb-4 fw-medium">{user.role || 'Colaborador'}</p>

                {/* Social/Contact Icons Placeholder (Conforme Imagem) */}
                <div className="d-flex justify-content-center gap-3 mb-2 text-muted">
                    <Facebook size={16} className="cursor-pointer icon-hover" />
                    <Github size={16} className="cursor-pointer icon-hover" />
                    <Twitter size={16} className="cursor-pointer icon-hover" />
                </div>
            </Card.Body>

            {/* Action Footer (Azul Claro) */}
            <Card.Footer className="bg-primary-subtle border-0 py-3 d-flex justify-content-center gap-4">
                <Button 
                    variant="link" 
                    className="p-0 text-primary opacity-75 hover-opacity-100" 
                    onClick={() => onEdit(user)}
                    title="Editar Usuário"
                >
                    <Edit3 size={18} />
                </Button>
                <Button 
                    variant="link" 
                    className="p-0 text-info opacity-75 hover-opacity-100" 
                    onClick={() => onResetPassword(user)}
                    title="Resetar Senha"
                >
                    <Key size={18} />
                </Button>
                <Button 
                    variant="link" 
                    className="p-0 text-danger opacity-75 hover-opacity-100" 
                    onClick={() => onDelete(user)}
                    title="Excluir Usuário"
                >
                    <Trash2 size={18} />
                </Button>
            </Card.Footer>

            <style>{`
                .user-card-hover {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .user-card-hover:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                }
                .icon-hover:hover {
                    color: var(--bs-primary);
                }
                .cursor-pointer {
                    cursor: pointer;
                }
                .bg-primary-subtle {
                    background-color: #e3f2fd !important;
                }
            `}</style>
        </Card>
    );
};

export default UserCard;
