import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AccessDenied: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Container fluid style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F2F6FA',
            textAlign: 'center',
            padding: '20px'
        }}>
            <div style={{
                marginBottom: '40px',
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: 'rgba(250, 137, 107, 0.1)',
                padding: '40px',
                borderRadius: '50%'
            }}>
                <ShieldAlert size={120} color="#FA896B" strokeWidth={1.5} />
            </div>

            <h1 className="h2 fw-extrabold mb-3" style={{ color: '#2A3547' }}>Acesso Negado!</h1>
            <p className="text-muted mb-4 fs-5 fw-medium" style={{ maxWidth: '600px' }}>
                Você não tem permissão para acessar esta área do sistema.
                Caso acredite que isto seja um erro, entre em contato com o administrador.
            </p>

            <div className="d-flex gap-3">
                <Button
                    variant="primary"
                    className="shadow-premium rounded-pill px-5 py-3 fw-bold"
                    onClick={() => navigate('/')}
                >
                    IR PARA O INÍCIO
                </Button>
                <Button
                    variant="outline-danger"
                    className="rounded-pill px-5 py-3 fw-bold d-flex align-items-center gap-2"
                    onClick={handleLogout}
                >
                    <LogOut size={20} />
                    TROCAR DE CONTA
                </Button>
            </div>

            <style>{`
                .shadow-premium {
                    background: #5D87FF !important;
                    border: none !important;
                    box-shadow: 0 10px 30px rgba(93, 135, 255, 0.25) !important;
                    transition: all 0.2s ease !important;
                }
                .shadow-premium:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 40px rgba(93, 135, 255, 0.35) !important;
                }
            `}</style>
        </Container>
    );
};

export default AccessDenied;
