import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
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
                    <Form.Label className="fw-bold small">Nome da Categoria</Form.Label>
                    <Form.Control
                        required
                        value={data.nome || ''}
                        onChange={(e) => onChange('nome', e.target.value)}
                        placeholder="Ex: Disjuntores"
                        style={{ borderRadius: '10px' }}
                    />
                </Form.Group>
            </Col>
            <Col md={12}>
                <Form.Group>
                    <Form.Label className="fw-bold small">Descrição</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={data.descricao || ''}
                        onChange={(e) => onChange('descricao', e.target.value)}
                        placeholder="Breve descrição da categoria..."
                        style={{ borderRadius: '10px' }}
                    />
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
