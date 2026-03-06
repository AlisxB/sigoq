import React, { useState } from 'react';
import { Rocket, ShieldCheck, Briefcase, Ruler } from 'lucide-react';
import { Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (role: Role) => {
        setIsLoading(true);
        // Simular um pequeno delay de rede para o efeito de login
        setTimeout(() => {
            login(role);
            setIsLoading(false);
            navigate('/');
        }, 800);
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            backgroundColor: '#111C2D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'fixed',
            top: 0,
            left: 0,
            overflowY: 'auto'
        }}>
            <Card style={{
                width: '100%',
                maxWidth: '440px',
                backgroundColor: '#1C293E',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '32px',
                padding: '40px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
            }} className="text-white border-0">

                <div className="text-center mb-4">
                    <div className="d-flex align-items-center justify-content-center mb-2">
                        <Rocket size={40} color="#5D87FF" className="me-2" />
                        <h2 className="mb-0 fw-bold" style={{ color: '#FFFFFF', letterSpacing: '-1px' }}>SIGOQ Admin</h2>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>Painel de Gestão e Orçamentos</p>
                </div>

                <div className="mb-4">
                    <p className="small fw-bold text-uppercase mb-3" style={{ color: '#5D87FF', letterSpacing: '1px', opacity: 0.8 }}>Acesso por Perfil (Demo)</p>
                    <div className="d-grid gap-3">
                        <Button
                            onClick={() => handleLogin('ADMIN')}
                            disabled={isLoading}
                            className="d-flex align-items-center gap-3 p-3 border-0 transition-all"
                            style={{ backgroundColor: 'rgba(93, 135, 255, 0.1)', borderRadius: '16px', color: '#5D87FF' }}
                        >
                            <div style={{ backgroundColor: '#5D87FF', padding: '8px', borderRadius: '10px' }}>
                                <ShieldCheck size={20} color="white" />
                            </div>
                            <div className="text-start">
                                <div className="fw-bold" style={{ fontSize: '15px' }}>Administrador</div>
                                <div className="small opacity-75">Acesso total ao sistema</div>
                            </div>
                        </Button>

                        <Button
                            onClick={() => handleLogin('COMERCIAL')}
                            disabled={isLoading}
                            className="d-flex align-items-center gap-3 p-3 border-0 transition-all"
                            style={{ backgroundColor: 'rgba(73, 190, 255, 0.1)', borderRadius: '16px', color: '#49BEFF' }}
                        >
                            <div style={{ backgroundColor: '#49BEFF', padding: '8px', borderRadius: '10px' }}>
                                <Briefcase size={20} color="white" />
                            </div>
                            <div className="text-start">
                                <div className="fw-bold" style={{ fontSize: '15px' }}>Comercial / Vendas</div>
                                <div className="small opacity-75">CRM, Clientes e Kanban</div>
                            </div>
                        </Button>

                        <Button
                            onClick={() => handleLogin('ORCAMENTISTA')}
                            disabled={isLoading}
                            className="d-flex align-items-center gap-3 p-3 border-0 transition-all"
                            style={{ backgroundColor: 'rgba(19, 222, 185, 0.1)', borderRadius: '16px', color: '#13DEB9' }}
                        >
                            <div style={{ backgroundColor: '#13DEB9', padding: '8px', borderRadius: '10px' }}>
                                <Ruler size={20} color="white" />
                            </div>
                            <div className="text-start">
                                <div className="fw-bold" style={{ fontSize: '15px' }}>Engenharia / Orçamentos</div>
                                <div className="small opacity-75">Produtos e Elaboração</div>
                            </div>
                        </Button>
                    </div>
                </div>

                <div className="text-center mt-4">
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>SIGOQ v1.0 · Sistema Privado</p>
                </div>
            </Card>
        </div>
    );
};

export default Login;
