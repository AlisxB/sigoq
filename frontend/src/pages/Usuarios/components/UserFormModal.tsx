import React, { useEffect } from 'react';
import { Modal, Button, Form, Row, Col, InputGroup } from 'react-bootstrap';
import { User, Mail, ShieldCheck, Phone, Image, UserPlus, Type, Tag } from 'lucide-react';
import { User as UserType } from '../../../types';
import { maskPhone } from '../../../utils/masks';

interface UserFormModalProps {
    show: boolean;
    onHide: () => void;
    onSave: (data: any) => void;
    user?: UserType | null;
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
                celular: maskPhone(user.celular || ''),
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
        // Remove máscara antes de salvar
        const dataToSave = {
            ...formData,
            celular: formData.celular.replace(/\D/g, '')
        };
        onSave(dataToSave);
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered className="modal-premium">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold d-flex align-items-center">
                    {user ? <Type size={24} className="text-primary me-2" /> : <UserPlus size={24} className="text-primary me-2" />}
                    {user ? 'Editar Colaborador' : 'Cadastrar Novo Membro'}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="px-4 py-4">
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted">Nome de Usuário (Login)</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <Tag size={18} className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        required
                                        className="border-start-0"
                                        placeholder="ex: joao.silva"
                                        disabled={!!user}
                                        value={formData.username}
                                        onChange={e => setFormData({...formData, username: e.target.value})}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted">E-mail Corporativo</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <Mail size={18} className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="email"
                                        required
                                        className="border-start-0"
                                        placeholder="ex: joao@empresa.com.br"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted">Primeiro Nome</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <User size={18} className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        required
                                        className="border-start-0"
                                        placeholder="Digite o primeiro nome..."
                                        value={formData.first_name}
                                        onChange={e => setFormData({...formData, first_name: e.target.value})}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted">Sobrenome Completo</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <User size={18} className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        required
                                        className="border-start-0"
                                        placeholder="Digite o sobrenome..."
                                        value={formData.last_name}
                                        onChange={e => setFormData({...formData, last_name: e.target.value})}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted">Cargo / Função</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <ShieldCheck size={18} className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Select
                                        className="border-start-0"
                                        value={formData.role}
                                        onChange={e => setFormData({...formData, role: e.target.value})}
                                    >
                                        <option value="VENDEDOR">Vendedor</option>
                                        <option value="ORCAMENTISTA">Orçamentista</option>
                                        <option value="GERENTE">Gerente</option>
                                        <option value="ADMIN">Administrador</option>
                                    </Form.Select>
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted">Celular / WhatsApp</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <Phone size={18} className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        className="border-start-0"
                                        placeholder="(00) 00000-0000"
                                        value={formData.celular}
                                        onChange={e => setFormData({...formData, celular: maskPhone(e.target.value)})}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted">URL do Avatar (Foto de Perfil)</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-light border-end-0">
                                        <Image size={18} className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        className="border-start-0"
                                        placeholder="Link da imagem (ex: https://dominio.com/foto.png)"
                                        value={formData.avatar_url}
                                        onChange={e => setFormData({...formData, avatar_url: e.target.value})}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer className="border-0 px-4 pb-4">
                    <Button variant="link" className="text-muted text-decoration-none" onClick={onHide}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={isSaving} className="px-5 fw-bold shadow-sm rounded-pill">
                        {isSaving ? 'Processando...' : (user ? 'Salvar Alterações' : 'Criar Conta')}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default UserFormModal;
