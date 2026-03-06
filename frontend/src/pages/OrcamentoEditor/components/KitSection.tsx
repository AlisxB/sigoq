import React from 'react';
import { Card, Table, Button, Form } from 'react-bootstrap';
import { Trash2, Compass } from 'lucide-react';
import { Kit, ItemOrcamento } from '../../../types';

interface KitSectionProps {
    kit: Kit;
    index: number;
    onUpdateName: (index: number, name: string) => void;
    onDeleteKit: (index: number) => void;
    onDeleteItem: (kitIndex: number, itemIndex: number) => void;
    onUpdateQuantity: (kitIndex: number, itemIndex: number, quantity: string) => void;
    onSearchMaterial: (index: number) => void;
}

const ItemRow: React.FC<{
    item: ItemOrcamento;
    kitIndex: number;
    itemIndex: number;
    onDelete: (ki: number, ii: number) => void;
    onUpdateQty: (ki: number, ii: number, q: string) => void;
}> = ({ item, kitIndex, itemIndex, onDelete, onUpdateQty }) => (
    <tr>
        <td className="ps-4">
            <div className="fw-medium text-dark">{item.codigo}</div>
            <div className="small text-muted">{item.descricao}</div>
        </td>
        <td style={{ width: '80px' }}>
            <Form.Control
                size="sm"
                type="number"
                className="text-dark"
                value={item.quantidade}
                onChange={(e) => onUpdateQty(kitIndex, itemIndex, e.target.value)}
            />
        </td>
        <td className="text-dark">R$ {parseFloat(item.custo_unit_snapshot).toFixed(2)}</td>
        <td className="fw-bold text-success">R$ {parseFloat(item.vlr_unit_venda || '0').toFixed(2)}</td>
        <td className="text-end pe-4">
            <Button variant="link" className="text-danger p-0" onClick={() => onDelete(kitIndex, itemIndex)}>
                <Trash2 size={16} />
            </Button>
        </td>
    </tr>
);

const KitSection: React.FC<KitSectionProps> = ({
    kit, index, onUpdateName, onDeleteKit, onDeleteItem, onUpdateQuantity, onSearchMaterial
}) => {
    return (
        <Card className="card-premium mb-4 border-start border-primary border-4 shadow-sm">
            <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                <Form.Control
                    className="border-0 fw-bold text-primary p-0 shadow-none fs-6 bg-transparent"
                    value={kit.nome}
                    onChange={(e) => onUpdateName(index, e.target.value)}
                    style={{ width: 'auto', minWidth: '200px' }}
                />
                <Button variant="outline-danger" size="sm" onClick={() => onDeleteKit(index)}>
                    <Trash2 size={14} />
                </Button>
            </Card.Header>
            <Card.Body className="p-0">
                <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light small">
                        <tr>
                            <th className="ps-4">Item</th>
                            <th>Qtd</th>
                            <th>Custo Unit.</th>
                            <th>Venda Unit.</th>
                            <th className="text-end pe-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kit.itens.map((item, iIdx) => (
                            <ItemRow
                                key={iIdx}
                                item={item}
                                kitIndex={index}
                                itemIndex={iIdx}
                                onDelete={onDeleteItem}
                                onUpdateQty={onUpdateQuantity}
                            />
                        ))}
                        <tr>
                            <td colSpan={5} className="p-3 bg-light text-center">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="d-inline-flex align-items-center"
                                    onClick={() => onSearchMaterial(index)}
                                >
                                    <Compass size={16} className="me-2" /> Buscar Material no Banco
                                </Button>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default KitSection;
