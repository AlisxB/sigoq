import React from 'react';
import { Form, Row, Col, InputGroup } from 'react-bootstrap';
import { Layers, AlignLeft } from 'lucide-react';
import GenericCRUD from '../components/GenericCRUD';
import { categoriaApi } from '../api/produtos';
import { Categoria } from '../types';

const Categorias: React.FC = () => {
    const columns = [
        { header: 'Nome', accessor: 'nome' as const },
        { header: 'Descrição', accessor: 'descricao' as const },
    ];

    const renderForm = (data: Partial<Categoria>, onChange: (field: keyof Categoria, value: any) => void) => (
        <Row className="g-3">
            <Col md={12}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Nome da Categoria</Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0"><Layers size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            required
                            className="form-control-premium border-start-0"
                            value={data.nome || ''}
                            onChange={(e) => onChange('nome', e.target.value)}
                            placeholder="Ex: Disjuntores"
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
            <Col md={12}>
                <Form.Group>
                    <Form.Label className="form-premium-label">Descrição</Form.Label>
                    <InputGroup>
                        <InputGroup.Text className="bg-light border-end-0 align-items-start pt-3"><AlignLeft size={18} className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            className="form-control-premium border-start-0"
                            value={data.descricao || ''}
                            onChange={(e) => onChange('descricao', e.target.value)}
                            placeholder="Breve descrição da categoria..."
                        />
                    </InputGroup>
                </Form.Group>
            </Col>
        </Row>
    );

    return (
        <GenericCRUD<Categoria>
            title="Gestão de Categorias"
            entityName="Categoria"
            api={categoriaApi}
            columns={columns}
            renderForm={renderForm}
            initialData={{ nome: '', descricao: '' }}
            queryKey="categorias"
        />
    );
};

export default Categorias;
