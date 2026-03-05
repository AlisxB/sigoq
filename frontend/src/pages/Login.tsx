import React from 'react';
import { Rocket, Github } from 'lucide-react';
import { Container, Card, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
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
            left: 0
        }}>
            <Card style={{
                width: '100%',
                maxWidth: '420px',
                backgroundColor: '#1C293E',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '40px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
            }} className="text-white">

                <div className="text-center mb-5">
                    <div className="d-flex align-items-center justify-content-center mb-2">
                        <Rocket size={32} color="#0085DB" className="me-2" />
                        <h2 className="mb-0 fw-bold" style={{ color: '#FFFFFF', letterSpacing: '-0.5px' }}>SIGOQ Admin</h2>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Acesse sua conta para continuar</p>
                </div>

                <Form>
                    <Form.Group className="mb-3" controlId="username">
                        <Form.Label style={{ fontSize: '14px', color: '#FFFFFF' }}>Usuário</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Digite seu usuário"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#FFFFFF',
                                borderRadius: '12px',
                                padding: '12px'
                            }}
                        />
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="password">
                        <Form.Label style={{ fontSize: '14px', color: '#FFFFFF' }}>Senha</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Digite sua senha"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#FFFFFF',
                                borderRadius: '12px',
                                padding: '12px'
                            }}
                        />
                    </Form.Group>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <Form.Check
                            type="checkbox"
                            id="keep-logged"
                            label="Manter conectado"
                            style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}
                        />
                        <Link to="/forgot-password" style={{ fontSize: '13px', color: '#0085DB', textDecoration: 'none' }}>Esqueceu a senha?</Link>
                    </div>

                    <Button
                        className="w-100 py-3 fw-bold mb-2"
                        style={{
                            backgroundColor: '#0085DB',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '16px',
                            transition: 'all 0.2s'
                        }}
                    >
                        Entrar no Sistema
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
