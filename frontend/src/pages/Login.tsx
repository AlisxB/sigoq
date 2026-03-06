import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { Rocket, User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    // States
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(username, password);
            navigate('/');
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.detail || 'Erro ao realizar login. Verifique suas credenciais.');
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            backgroundColor: '#F2F6FA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'fixed',
            top: 0,
            left: 0,
            overflowY: 'auto',
            backgroundImage: 'radial-gradient(circle at center, #F2F6FA 0%, #E3E9F0 100%)',
            zIndex: 9999
        }}>
            <Card style={{
                width: '100%',
                maxWidth: '480px',
                backgroundColor: '#FFFFFF',
                borderRadius: '32px',
                padding: '48px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.05)',
                border: 'none',
                zIndex: 10000
            }}>
                <div className="text-center mb-5">
                    <div className="d-flex align-items-center justify-content-center mb-3">
                        <Rocket size={38} color="#5D87FF" className="me-2" style={{ transform: 'rotate(-20deg)' }} />
                        <h2 className="mb-0 fw-extrabold" style={{ color: '#2A3547', letterSpacing: '-1.5px', fontSize: '2rem' }}>
                            SIGOQ <span style={{ color: '#5D87FF' }}>Admin</span>
                        </h2>
                    </div>
                </div>

                {error && (
                    <Alert variant="danger" className="text-center py-2 px-3 border-0 rounded-12 small fw-bold mb-4 animate-shake">
                        {error}
                    </Alert>
                )}

                <Form onSubmit={handleSignIn}>
                    <Form.Group className="mb-4">
                        <Form.Label className="form-premium-label">Nome de Usuário</Form.Label>
                        <div className="input-icon-wrapper-premium">
                            <User size={18} />
                            <Form.Control
                                className="form-control-premium-v2"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Seu nome de usuário"
                                required
                            />
                        </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Label className="form-premium-label">Senha</Form.Label>
                        <div className="input-icon-wrapper-premium">
                            <Lock size={18} />
                            <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                className="form-control-premium-v2"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Sua senha secreta"
                            />
                            <div
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </div>
                        </div>
                    </Form.Group>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <Form.Check
                            type="checkbox"
                            className="small fw-semibold text-muted"
                            label="Mantenha-me conectado"
                            id="keep-logged-in"
                        />
                        <a href="#reset" className="text-primary small fw-bold text-decoration-none">Esqueceu sua senha?</a>
                    </div>

                    <Button
                        variant="primary"
                        type="submit"
                        disabled={isLoading}
                        className="w-100 py-3 rounded-pill fw-bold shadow-premium d-flex align-items-center justify-content-center gap-2 mb-2"
                        style={{ height: '54px' }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="spinner-loader" size={20} />
                                ENTRANDO...
                            </>
                        ) : 'ENTRAR NO SISTEMA'}
                    </Button>
                </Form>
            </Card>

            <style>{`
                .form-premium-label {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #2A3547;
                    margin-bottom: 8px;
                }
                .form-control-premium-v2 {
                    border-radius: 12px !important;
                    border: 1px solid #DFE5EF !important;
                    padding: 12px 42px 12px 42px !important;
                    font-size: 0.95rem !important;
                    color: #2A3547 !important;
                    transition: all 0.2s ease !important;
                    height: 50px !important;
                    box-shadow: none !important;
                }
                .form-control-premium-v2:focus {
                    border-color: #5D87FF !important;
                    box-shadow: 0 0 0 4px rgba(93, 135, 255, 0.1) !important;
                }
                .input-icon-wrapper-premium {
                    position: relative;
                }
                .input-icon-wrapper-premium > svg {
                    position: absolute;
                    top: 50%;
                    left: 14px;
                    transform: translateY(-50%);
                    color: #A1B4CB;
                    pointer-events: none;
                    z-index: 2;
                }
                .password-toggle {
                    position: absolute;
                    top: 50%;
                    right: 14px;
                    transform: translateY(-50%);
                    cursor: pointer;
                    color: #A1B4CB;
                    display: flex;
                    align-items: center;
                    padding: 4px;
                    z-index: 10;
                    background: none;
                    border: none;
                }
                .password-toggle:hover {
                    color: #5D87FF;
                }
                .shadow-premium {
                    background: #5D87FF !important;
                    border: none !important;
                    box-shadow: 0 10px 30px rgba(93, 135, 255, 0.25) !important;
                    transition: all 0.2s ease !important;
                }
                .shadow-premium:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 40px rgba(93, 135, 255, 0.35) !important;
                    background: #4570EA !important;
                }
                .spinner-loader {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
                .rounded-12 { border-radius: 12px !important; }
            `}</style>
        </div>
    );
};

export default Login;
