import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import { ArrowLeft, Save } from 'lucide-react';

const OrcamentoEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <Button variant="link" onClick={() => navigate(-1)} className="me-3 p-0 text-dark">
                        <ArrowLeft size={24} />
                    </Button>
                    <h2 className="h3 fw-bold mb-0">
                        {isNew ? 'Novo Orçamento' : `Editando Orçamento #${id}`}
                    </h2>
                </div>
                <Button variant="success" className="d-flex align-items-center">
                    <Save size={18} className="me-2" /> Salvar Orçamento
                </Button>
            </div>

            <Card className="card-premium">
                <Card.Body>
                    <p className="text-center py-5 text-muted">
                        Editor de Orçamentos Complexo em desenvolvimento (Fase 7.4).
                    </p>
                </Card.Body>
            </Card>
        </div>
    );
};

export default OrcamentoEditor;
