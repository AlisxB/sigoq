import React, { useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { User } from '../../../types';

interface UserFormModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (data: any) => void;
    user?: User | null;
    isSaving: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ show, onHide, onSave, user, isSaving }) => {
    const [formData, setFormData] = React.useState<any>({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        role: 'VENDEDOR',
        celular: '',
        avatar_url: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role || 'VENDEDOR',
                celular: user.celular || '',
                avatar_url: user.avatar_url || ''
            });
        } else {
            setFormData({
                username: '',
                first_name: '',
                last_name: '',
                email: '',
                role: 'VENDEDOR',
                celular: '',
                avatar_url: ''
            });
        }
    }, [user, show]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="modal-premium">
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="fw-bold">{user ? 'Editar Colaborador' : 'Cadastrar Novo Membro'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="px-4 pb-4">
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Nome de Usuário (Login)</Form.Label>
                                <Form.Control
                                    required
                                    disabled={!!user}
                                    value={formData.username}
                                    onChange={e => setFormData({...formData, username: e.target.value})}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">E-mail Corporativo</Form.Label>
                                <Form.Control
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Nome</Form.Label>
                                <Form.Control
                                    required
                                    value={formData.first_name}
                                    onChange={e => setFormData({...formData, first_name: e.target.value})}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Sobrenome</Form.Label>
                                <Form.Control
                                    required
                                    value={formData.last_name}
                                    onChange={e => setFormData({...formData, last_name: e.target.value})}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Cargo / Função</Form.Label>
                                <Form.Select
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="VENDEDOR">Vendedor</option>
                                    <option value="ORCAMENTISTA">Orçamentista</option>
                                    <option value="GERENTE">Gerente</option>
                                    <option value="ADMIN">Administrador</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Celular / WhatsApp</Form.Label>
                                <Form.Control
                                    value={formData.celular}
                                    onChange={e => setFormData({...formData, celular: e.target.value})}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="small fw-bold">URL do Avatar (Foto)</Form.Label>
                                <Form.Control
                                    placeholder="https://exemplo.com/foto.jpg"
                                    value={formData.avatar_url}
                                    onChange={e => setFormData({...formData, avatar_url: e.target.value})}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer className="border-0 px-4 pb-4">
                    <Button variant="link" className="text-muted" onClick={onHide}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={isSaving} className="px-4 fw-bold shadow-sm">
                        {isSaving ? 'Salvando...' : (user ? 'Salvar Alterações' : 'Criar Conta')}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default UserFormModal;
