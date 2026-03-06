import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Calculator } from 'lucide-react';
import { Orcamento } from '../../../types';

interface PricingSummaryProps {
    id: string | undefined;
    orcamento: Partial<Orcamento>;
    onRecalculate: () => void;
}

const PricingSummary: React.FC<PricingSummaryProps> = ({ id, orcamento, onRecalculate }) => {
    const markup = (orcamento.custo_total && parseFloat(orcamento.custo_total) > 0)
        ? (parseFloat(orcamento.valor_total || '0') / parseFloat(orcamento.custo_total)).toFixed(2)
        : '0.00';

    return (
        <Card className="card-premium sticky-top shadow-sm" style={{ top: '100px' }}>
            <Card.Body>
                <h5 className="fw-bold mb-4">Resumo Financeiro</h5>

                <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Custo Total:</span>
                    <span className="fw-medium text-dark">
                        R$ {parseFloat(orcamento.custo_total || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                </div>

                <div className="d-flex justify-content-between mb-4">
                    <span className="text-muted small">Markup Médio:</span>
                    <span className="fw-medium text-primary">
                        {markup}x
                    </span>
                </div>

                <hr />

                <div className="py-3">
                    <h6 className="small text-muted mb-2">VALOR TOTAL DA PROPOSTA</h6>
                    <div className="h2 fw-bold text-success mb-0">
                        R$ {parseFloat(orcamento.valor_total || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>

                <div className="mt-4">
                    <Button 
                        variant="primary" 
                        className="w-100 py-3 fw-bold mb-3 shadow-sm d-flex justify-content-center align-items-center" 
                        onClick={onRecalculate}
                    >
                        <Calculator className="me-2" size={18} /> ATUALIZAR CÁLCULOS
                    </Button>
                    <Button
                        variant="outline-secondary"
                        className="w-100 py-2"
                        onClick={() => window.open(`http://127.0.0.1:8000/orcamentos/pdf/${id}/`, '_blank')}
                        disabled={!id}
                    >
                        GERAR PREVIEW PDF
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default PricingSummary;
