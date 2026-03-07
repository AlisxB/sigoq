import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { User, Mail, Phone, Lock, Camera, Check, RefreshCw, MapPin, Globe, Type } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usuarioApi } from '../api/usuarios';
import { maskPhone } from '../utils/masks';

const Perfil: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const [isSavingDetails, setIsSavingDetails] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);

    const [detailsForm, setDetailsForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        celular: '',
        avatar_url: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        if (user) {
            setDetailsForm(prev => ({
                ...prev,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                celular: maskPhone(user.celular || ''),
                avatar_url: user.avatar_url || ''
            }));
        }
    }, [user]);

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSavingDetails(true);
        setMessage(null);
        try {
            const dataToSave = {
                first_name: detailsForm.first_name,
                last_name: detailsForm.last_name,
                email: detailsForm.email,
                celular: detailsForm.celular.replace(/\D/g, ''),
                avatar_url: detailsForm.avatar_url
            };
            await usuarioApi.update(user.id, dataToSave);
            await refreshUser();
            setMessage({ text: 'Perfil atualizado com sucesso!', type: 'success' });
        } catch (error: any) {
            setMessage({ text: error.response?.data?.detail || 'Erro ao atualizar perfil.', type: 'danger' });
        } finally {
            setIsSavingDetails(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setMessage({ text: 'As senhas não coincidem.', type: 'danger' });
            return;
        }

        setIsSavingPassword(true);
        setMessage(null);
        try {
            await usuarioApi.changePassword({
                old_password: passwordForm.old_password,
                new_password: passwordForm.new_password
            });
            setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
            setMessage({ text: 'Senha alterada com sucesso!', type: 'success' });
        } catch (error: any) {
            setMessage({ text: error.response?.data?.detail || 'Erro ao alterar senha.', type: 'danger' });
        } finally {
            setIsSavingPassword(false);
        }
    };

    const handleResetAvatar = () => {
        setDetailsForm(prev => ({ ...prev, avatar_url: '' }));
    };

    return (
        <Container fluid className="py-4 px-lg-5">
            <div className="mb-4">
                <h1 className="h4 fw-extrabold mb-1" style={{ color: '#2A3547', letterSpacing: '-0.5px' }}>Configurações de Perfil</h1>
                <p className="text-muted small mb-0">Gerencie suas informações pessoais e segurança da conta.</p>
            </div>

            {message && (
                <Alert variant={message.type} onClose={() => setMessage(null)} dismissible className="border-0 shadow-sm rounded-12 mb-4">
                    {message.text}
                </Alert>
            )}

            <Row className="g-4">
                {/* Change Profile Card */}
                <Col lg={6}>
                    <Card className="card-premium h-100 border-0 shadow-sm" style={{ borderRadius: '24px' }}>
                        <Card.Body className="p-4 d-flex flex-column align-items-center justify-content-center text-center">
                            <h5 className="fw-bold mb-1 w-100 text-start">Foto de Perfil</h5>
                            <p className="text-muted small mb-4 w-100 text-start">Personalize sua imagem de identificação no sistema</p>
                            
                            <div className="position-relative mb-4">
                                <div style={{
                                    width: '140px',
                                    height: '140px',
                                    borderRadius: '50%',
                                    backgroundColor: '#F2F6FA',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    border: '4px solid #FFF',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                }}>
                                    {detailsForm.avatar_url ? (
                                        <img src={detailsForm.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <User size={60} className="text-muted opacity-30" />
                                    )}
                                </div>
                                <div style={{
                                    position: 'absolute',
                                    bottom: '5px',
                                    right: '5px',
                                    backgroundColor: '#5D87FF',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    border: '2px solid #FFF'
                                }}>
                                    <Camera size={16} />
                                </div>
                            </div>

                            <div className="d-flex gap-2 mb-3">
                                <Button 
                                    variant="primary" 
                                    className="px-4 fw-bold rounded-pill"
                                    onClick={() => {
                                        const url = prompt('Insira a URL da imagem:', detailsForm.avatar_url);
                                        if (url !== null) setDetailsForm(prev => ({ ...prev, avatar_url: url }));
                                    }}
                                >
                                    Alterar Foto
                                </Button>
                                <Button 
                                    variant="outline-primary" 
                                    className="px-4 fw-bold rounded-pill"
                                    onClick={handleResetAvatar}
                                >
                                    Remover
                                </Button>
                            </div>
                            <p className="text-muted x-small mb-0">Formatos aceitos: JPG, GIF ou PNG. Tamanho máx: 800K</p>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Change Password Card */}
                <Col lg={6}>
                    <Card className="card-premium h-100 border-0 shadow-sm" style={{ borderRadius: '24px' }}>
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-1">Segurança</h5>
                            <p className="text-muted small mb-4">Mantenha sua conta segura alterando sua senha regularmente</p>
                            
                            <Form onSubmit={handlePasswordSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted">Senha Atual</Form.Label>
                                    <div className="input-group-premium rounded-12 border overflow-hidden">
                                        <Form.Control 
                                            type="password"
                                            required
                                            className="border-0 shadow-none py-2 px-3"
                                            placeholder="Confirme sua senha atual"
                                            value={passwordForm.old_password}
                                            onChange={e => setPasswordForm({...passwordForm, old_password: e.target.value})}
                                        />
                                    </div>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted">Nova Senha</Form.Label>
                                    <div className="input-group-premium rounded-12 border overflow-hidden">
                                        <Form.Control 
                                            type="password"
                                            required
                                            className="border-0 shadow-none py-2 px-3"
                                            placeholder="Mínimo 8 caracteres"
                                            value={passwordForm.new_password}
                                            onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})}
                                        />
                                    </div>
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-muted">Confirmar Nova Senha</Form.Label>
                                    <div className="input-group-premium rounded-12 border overflow-hidden">
                                        <Form.Control 
                                            type="password"
                                            required
                                            className="border-0 shadow-none py-2 px-3"
                                            placeholder="Repita a nova senha"
                                            value={passwordForm.confirm_password}
                                            onChange={e => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                                        />
                                    </div>
                                </Form.Group>
                                <Button 
                                    type="submit" 
                                    variant="primary" 
                                    className="w-100 fw-bold rounded-pill py-2 shadow-sm"
                                    disabled={isSavingPassword}
                                >
                                    {isSavingPassword ? <Spinner size="sm" /> : 'Atualizar Senha'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Personal Details Card */}
                <Col lg={12}>
                    <Card className="card-premium border-0 shadow-sm" style={{ borderRadius: '24px' }}>
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-1">Dados Cadastrais</h5>
                            <p className="text-muted small mb-4">Informações básicas de identificação e contato</p>
                            
                            <Form onSubmit={handleDetailsSubmit}>
                                <Row className="g-4">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted">Nome</Form.Label>
                                            <div className="input-group-premium rounded-12 border d-flex align-items-center overflow-hidden bg-light bg-opacity-50">
                                                <div className="ps-3 pe-2 text-muted opacity-50"><Type size={18} /></div>
                                                <Form.Control 
                                                    disabled
                                                    className="border-0 shadow-none py-2 px-0 bg-transparent"
                                                    value={detailsForm.first_name}
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted">Sobrenome</Form.Label>
                                            <div className="input-group-premium rounded-12 border d-flex align-items-center overflow-hidden bg-light bg-opacity-50">
                                                <div className="ps-3 pe-2 text-muted opacity-50"><Type size={18} /></div>
                                                <Form.Control 
                                                    disabled
                                                    className="border-0 shadow-none py-2 px-0 bg-transparent"
                                                    value={detailsForm.last_name}
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted">E-mail Corporativo</Form.Label>
                                            <div className="input-group-premium rounded-12 border d-flex align-items-center overflow-hidden bg-light bg-opacity-50">
                                                <div className="ps-3 pe-2 text-muted opacity-50"><Mail size={18} /></div>
                                                <Form.Control 
                                                    type="email"
                                                    disabled
                                                    className="border-0 shadow-none py-2 px-0 bg-transparent"
                                                    value={detailsForm.email}
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-muted">Celular / WhatsApp</Form.Label>
                                            <div className="input-group-premium rounded-12 border d-flex align-items-center overflow-hidden">
                                                <div className="ps-3 pe-2 text-muted"><Phone size={18} /></div>
                                                <Form.Control 
                                                    required
                                                    className="border-0 shadow-none py-2 px-0"
                                                    placeholder="(00) 00000-0000"
                                                    value={detailsForm.celular}
                                                    onChange={e => setDetailsForm({...detailsForm, celular: maskPhone(e.target.value)})}
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={12} className="text-end mt-4">
                                        <Button 
                                            type="submit" 
                                            variant="primary" 
                                            className="px-5 fw-bold rounded-pill shadow-sm py-2"
                                            disabled={isSavingDetails}
                                        >
                                            {isSavingDetails ? <Spinner size="sm" /> : 'Salvar Alterações'}
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>{`
                .rounded-12 { border-radius: 12px !important; }
                .x-small { font-size: 0.75rem; }
                .input-group-premium:focus-within {
                    border-color: #5D87FF !important;
                    box-shadow: 0 0 0 4px rgba(93, 135, 255, 0.1) !important;
                }
            `}</style>
        </Container>
    );
};

export default Perfil;
