import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Row, Col, Card, Form, Button, Spinner, Table, Alert } from 'react-bootstrap';
import { Save, Info, CheckCircle } from 'lucide-react';
import { orcamentoApi } from '../api/orcamentos';
import { ConfiguracaoPreco } from '../types';

const CONFIG_FIELDS = [
    { key: 'markup_engenharia', label: 'Markup Engenharia', color: '#3498db' },
    { key: 'markup_capitalizacao', label: 'Markup Capitalização', color: '#9b59b6' },
    { key: 'markup_frete', label: 'Markup Frete (Padrão)', color: '#f1c40f' },
    { key: 'markup_imposto', label: 'Markup Impostos', color: '#e74c3c' },
    { key: 'markup_comissao', label: 'Markup Comissão', color: '#2ecc71' },
    { key: 'markup_difal', label: 'Markup DIFAL', color: '#1abc9c' },
    { key: 'markup_frete_especial', label: 'Markup Frete Especial', color: '#34495e' },
    { key: 'margem_contribuicao_padrao', label: 'Margem Contribuição (Alvo)', color: '#e67e22' },
];

const ConfiguracoesPreco: React.FC = () => {
    const queryClient = useQueryClient();
    const [success, setSuccess] = useState(false);

    const { data: configs = [], isLoading } = useQuery({
        queryKey: ['config-preco'],
        queryFn: orcamentoApi.getConfig
    });

    const activeConfig = configs.find(c => c.ativo) || configs[0];

    const updateMutation = useMutation({
        mutationFn: (data: ConfiguracaoPreco) => orcamentoApi.updateConfig(data.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['config-preco'] });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }
    });

    const [localData, setLocalData] = useState<Partial<ConfiguracaoPreco> | null>(null);

    React.useEffect(() => {
        if (activeConfig) setLocalData(activeConfig);
    }, [activeConfig]);

    if (isLoading || !localData) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    const handleChange = (field: keyof ConfiguracaoPreco, value: string) => {
        setLocalData(prev => prev ? { ...prev, [field]: value } : null);
    };

    const totalMarkups = CONFIG_FIELDS.filter(f => f.key !== 'margem_contribuicao_padrao')
        .reduce((acc, f) => acc + parseFloat(localData[f.key as keyof ConfiguracaoPreco] as string || '0'), 0);

    const marginTarget = parseFloat(localData.margem_contribuicao_padrao || '0');
    const totalDivisor = 1 - (totalMarkups + marginTarget);

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Configurações de Preço</h2>
                    <p className="text-muted small mb-0">Parâmetros globais para cálculo automático de orçamentos.</p>
                </div>
                <Button
                    variant="success"
                    className="d-flex align-items-center btn-premium-primary shadow-sm"
                    onClick={() => updateMutation.mutate(localData as ConfiguracaoPreco)}
                    disabled={updateMutation.isPending}
                >
                    <Save size={18} className="me-2" />
                    {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </div>

            {success && (
                <Alert variant="success" className="d-flex align-items-center border-0 shadow-sm mb-4">
                    <CheckCircle size={20} className="me-2" />
                    Parâmetros atualizados com sucesso! Todos os novos orçamentos usarão estes valores.
                </Alert>
            )}

            <Row className="g-4">
                <Col lg={8}>
                    <Card className="card-premium mb-4">
                        <Card.Body>
                            <h5 className="fw-bold mb-4">Markups de Encargos</h5>
                            <Row className="g-3">
                                {CONFIG_FIELDS.map(field => (
                                    <Col md={6} key={field.key}>
                                        <Form.Group>
                                            <Form.Label className="form-premium-label d-flex justify-content-between text-muted">
                                                {field.label}
                                                <span className="text-dark">{(parseFloat(localData[field.key as keyof ConfiguracaoPreco] as string || '0') * 100).toFixed(2)}%</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="number"
                                                step="0.0001"
                                                className="form-control-premium"
                                                value={localData[field.key as keyof ConfiguracaoPreco] as string}
                                                onChange={(e) => handleChange(field.key as keyof ConfiguracaoPreco, e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="card-premium">
                        <Card.Body>
                            <h5 className="fw-bold mb-3">Simulação de Cálculo</h5>
                            <p className="text-muted small mb-4">Baseado nos parâmetros acima (Fórmula: Custo / (1 - (Markups + Margem)))</p>
                            <Table responsive hover size="sm">
                                <thead className="text-muted x-small uppercase">
                                    <tr>
                                        <th>Custo do Item</th>
                                        <th>Soma Encargos</th>
                                        <th>Margem Alvo</th>
                                        <th>Markup Final (Venda)</th>
                                        <th className="text-end">Preço de Venda</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="align-middle">
                                        <td className="fw-bold">R$ 1.000,00</td>
                                        <td>{(totalMarkups * 100).toFixed(2)}%</td>
                                        <td>{(marginTarget * 100).toFixed(2)}%</td>
                                        <td className="text-primary fw-bold">{(1 / totalDivisor).toFixed(2)}x</td>
                                        <td className="text-end text-success fw-bold h4 mb-0">
                                            R$ {(1000 / totalDivisor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="bg-primary text-white border-0 shadow-lg mb-4" style={{ borderRadius: '15px' }}>
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center mb-3">
                                <Info size={24} className="me-2" />
                                <h5 className="fw-bold mb-0">Informação Importante</h5>
                            </div>
                            <p className="small mb-0 opacity-75">
                                Estes valores são utilizados para gerar o **Preço de Venda** sugerido.
                                O orçamentista ainda poderá ajustar a margem individualmente por orçamento,
                                mas os markups de impostos e encargos são fixos para garantir a saúde financeira.
                            </p>
                        </Card.Body>
                    </Card>

                    <Card className="card-premium border-start border-warning border-4">
                        <Card.Body>
                            <h6 className="fw-bold mb-2">Composição do Markup</h6>
                            <div className="mt-3">
                                {CONFIG_FIELDS.filter(f => f.key !== 'margem_contribuicao_padrao').map(f => {
                                    const value = parseFloat(localData[f.key as keyof ConfiguracaoPreco] as string || '0');
                                    const percent = (value / totalMarkups) * 100;
                                    return (
                                        <div key={f.key} className="mb-2">
                                            <div className="d-flex justify-content-between x-small mb-1">
                                                <span>{f.label}</span>
                                                <span className="fw-bold">{(value * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="progress" style={{ height: '4px' }}>
                                                <div
                                                    className="progress-bar"
                                                    style={{ width: `${percent}%`, backgroundColor: f.color }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>{`
                .x-small { font-size: 0.75rem; }
                .uppercase { text-transform: uppercase; letter-spacing: 0.05em; }
            `}</style>
        </Container>
    );
};

export default ConfiguracoesPreco;
