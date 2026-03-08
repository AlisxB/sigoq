import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Container, Row, Col, Card, Form, Button, Spinner, Table, Alert, InputGroup, Badge } from 'react-bootstrap';
import { Save, Info, CheckCircle, Percent, PieChart as PieChartIcon } from 'lucide-react';
import { orcamentoApi } from '../api/orcamentos';
import { ConfiguracaoPreco } from '../types';
import DonutChart from '../components/Charts/DonutChart';

const CONFIG_FIELDS = [
    { key: 'markup_engenharia', label: 'Engenharia', color: '#5D87FF' },
    { key: 'markup_capitalizacao', label: 'Capitalização', color: '#49BEFF' },
    { key: 'markup_frete', label: 'Frete (Padrão)', color: '#13DEB9' },
    { key: 'markup_imposto', label: 'Impostos', color: '#FFAE1F' },
    { key: 'markup_comissao', label: 'Comissão', color: '#FA896B' },
    { key: 'markup_difal', label: 'DIFAL', color: '#539BFF' },
    { key: 'markup_frete_especial', label: 'Frete Especial', color: '#7C8FAC' },
    { key: 'margem_contribuicao_padrao', label: 'Margem Alvo', color: '#2A3547' },
];

const ConfiguracoesPreco: React.FC = () => {
    const queryClient = useQueryClient();
    const [success, setSuccess] = useState(false);

    const { data: configsData, isLoading } = useQuery<ConfiguracaoPreco[]>({
        queryKey: ['config-preco'],
        queryFn: orcamentoApi.getConfig
    });
    const configs = Array.isArray(configsData) ? configsData : [];

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
        if (activeConfig) {
            setLocalData(activeConfig);
        } else if (!isLoading && configs.length === 0) {
            // Inicializa com valores zerados se não houver nenhuma config no banco
            setLocalData({
                markup_engenharia: '0.00',
                markup_capitalizacao: '0.00',
                markup_frete: '0.00',
                markup_imposto: '0.00',
                markup_comissao: '0.00',
                markup_difal: '0.00',
                markup_frete_especial: '0.00',
                margem_contribuicao_padrao: '0.00',
                ativo: true
            });
        }
    }, [activeConfig, isLoading, configs.length]);

    const totalMarkups = useMemo(() => {
        if (!localData) return 0;
        return CONFIG_FIELDS.filter(f => f.key !== 'margem_contribuicao_padrao')
            .reduce((acc, f) => acc + parseFloat(localData[f.key as keyof ConfiguracaoPreco] as string || '0'), 0);
    }, [localData]);

    const marginTarget = useMemo(() => parseFloat(localData?.margem_contribuicao_padrao || '0'), [localData]);
    const totalDivisor = useMemo(() => {
        const div = 1 - (totalMarkups + marginTarget);
        return div > 0 ? div : 0.0001; // Evita divisão por zero
    }, [totalMarkups, marginTarget]);

    // Dados para o Gráfico de Relação
    const chartLabels = useMemo(() => 
        CONFIG_FIELDS.filter(f => parseFloat(localData?.[f.key as keyof ConfiguracaoPreco] as string || '0') > 0).map(f => f.label),
    [localData]);

    const chartSeries = useMemo(() => 
        CONFIG_FIELDS.filter(f => parseFloat(localData?.[f.key as keyof ConfiguracaoPreco] as string || '0') > 0)
            .map(f => parseFloat(((parseFloat(localData?.[f.key as keyof ConfiguracaoPreco] as string || '0') * 100).toFixed(2)))),
    [localData]);

    const chartColors = useMemo(() => 
        CONFIG_FIELDS.filter(f => parseFloat(localData?.[f.key as keyof ConfiguracaoPreco] as string || '0') > 0).map(f => f.color),
    [localData]);

    if (isLoading || !localData) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

    const handlePercentChange = (field: keyof ConfiguracaoPreco, displayValue: string) => {
        const floatVal = parseFloat(displayValue) || 0;
        const decimalValue = (floatVal / 100).toString();
        setLocalData(prev => prev ? { ...prev, [field]: decimalValue } : null);
    };

    const handleSave = () => {
        if (!localData) return;
        if (localData.id) {
            updateMutation.mutate(localData as ConfiguracaoPreco);
        } else {
            // Se for uma nova config (banco vazio)
            orcamentoApi.createConfig(localData).then(() => {
                queryClient.invalidateQueries({ queryKey: ['config-preco'] });
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            });
        }
    };

    return (
        <Container fluid className="px-1 py-2 pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4 pt-2">
                <div>
                    <h1 className="h4 fw-extrabold mb-1" style={{ color: '#2A3547', letterSpacing: '-0.5px' }}>Configuração de Markups</h1>
                    <p className="text-muted small mb-0 fw-medium">Defina os percentuais de encargos e margens globais.</p>
                </div>
                <Button
                    variant="primary"
                    className="shadow-premium rounded-pill px-4 fw-bold d-flex align-items-center"
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                >
                    <Save size={18} className="me-2" />
                    {updateMutation.isPending ? 'Salvando...' : 'SALVAR PARÂMETROS'}
                </Button>
            </div>

            {success && (
                <Alert variant="success" className="d-flex align-items-center border-0 shadow-sm mb-4 rounded-16">
                    <CheckCircle size={20} className="me-2" />
                    <span className="fw-bold">Markups atualizados com sucesso!</span> Novos itens seguirão estas métricas.
                </Alert>
            )}

            <Row className="g-4">
                <Col lg={7}>
                    <Card className="card-premium mb-4 border-0 shadow-sm" style={{ borderRadius: '24px' }}>
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                                <Percent size={20} className="text-primary" /> Percentuais de Encargos
                            </h5>
                            <Row className="g-3">
                                {CONFIG_FIELDS.map(field => (
                                    <Col md={6} key={field.key}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-dark opacity-75 mb-2">{field.label}</Form.Label>
                                            <InputGroup className="modern-input-group border shadow-sm rounded-12 overflow-hidden">
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    className="border-0 ps-3 fw-bold text-dark shadow-none"
                                                    value={(parseFloat(localData[field.key as keyof ConfiguracaoPreco] as string || '0') * 100).toFixed(2)}
                                                    onChange={(e) => handlePercentChange(field.key as keyof ConfiguracaoPreco, e.target.value)}
                                                    placeholder="0.00"
                                                />
                                                <InputGroup.Text className="bg-light border-0 text-muted fw-bold">%</InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="card-premium border-0 shadow-sm overflow-hidden" style={{ borderRadius: '24px' }}>
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                                <Info size={20} className="text-info" /> Simulação de Preço Final
                            </h5>
                            <p className="text-muted small mb-4 fw-medium">Exemplo prático aplicado a um custo base de R$ 1.000,00.</p>
                            <Table responsive hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4 py-3 text-muted small fw-bold uppercase letter-spacing-1">CUSTO</th>
                                        <th className="py-3 text-muted small fw-bold uppercase letter-spacing-1">Σ ENCARGOS</th>
                                        <th className="py-3 text-muted small fw-bold uppercase letter-spacing-1">MARGEM</th>
                                        <th className="py-3 text-end text-muted small fw-bold uppercase letter-spacing-1">VENDA FINAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="align-middle border-bottom border-light">
                                        <td className="ps-4 py-3 fw-bold text-dark">R$ 1.000,00</td>
                                        <td>
                                            <Badge bg="light" text="dark" className="fw-bold rounded-pill px-3 py-2 border">
                                                {(totalMarkups * 100).toFixed(2)}%
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge bg="primary-subtle" className="text-primary fw-bold rounded-pill px-3 py-2 border">
                                                {(marginTarget * 100).toFixed(2)}%
                                            </Badge>
                                        </td>
                                        <td className="text-end py-3">
                                            <div className="text-success fw-extrabold h4 mb-0">
                                                R$ {(1000 / totalDivisor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </div>
                                            <div className="text-muted x-small fw-bold">DIVISOR: {totalDivisor.toFixed(4)}</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={5}>
                    {/* Gráfico de Relação Restaurado e Reutilizável */}
                    <Card className="card-premium mb-4 border-0 shadow-sm" style={{ borderRadius: '24px' }}>
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
                                <PieChartIcon size={20} className="text-primary" /> Relação de Markups
                            </h5>
                            <p className="text-muted small mb-4">Composição percentual do Markup total.</p>
                            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '350px' }}>
                                <DonutChart 
                                    series={chartSeries}
                                    labels={chartLabels}
                                    colors={chartColors}
                                    height={380}
                                    title="Markups"
                                />
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="bg-primary border-0 shadow-premium p-2" style={{ borderRadius: '24px' }}>
                        <Card.Body className="p-4 text-white">
                            <div className="d-flex align-items-center mb-3 text-white">
                                <Info size={24} className="me-2 text-white" />
                                <h5 className="fw-bold mb-0 text-white">Regra de Cálculo</h5>
                            </div>
                            <p className="small mb-4 text-white opacity-90">
                                O sistema aplica o Markup Divisor. O preço de venda é calculado dividindo o custo pelo inverso da soma de todos os percentuais incidentes.
                            </p>
                            <div className="bg-white bg-opacity-10 p-3 rounded-16 border border-white border-opacity-20 text-center">
                                <code className="text-white fw-bold h6 mb-0">Venda = Custo / Divisor</code>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>{`
                .rounded-12 { border-radius: 12px !important; }
                .rounded-16 { border-radius: 16px !important; }
                .shadow-premium { box-shadow: 0 10px 30px rgba(93, 135, 255, 0.2) !important; }
                .modern-input-group { border: 1px solid #DFE5EF; border-radius: 12px; transition: 0.3s; }
                .modern-input-group:focus-within { border-color: #5D87FF; box-shadow: 0 0 0 4px rgba(93, 135, 255, 0.1); }
                .bg-primary-subtle { background-color: rgba(93, 135, 255, 0.1) !important; }
                .text-primary { color: #5D87FF !important; }
                .letter-spacing-1 { letter-spacing: 1px; }
            `}</style>
        </Container>
    );
};

export default ConfiguracoesPreco;
