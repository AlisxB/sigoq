import React, { useState, useRef, useEffect } from 'react';
import { Form, Dropdown, InputGroup } from 'react-bootstrap';
import { Search, X } from 'lucide-react';

interface AutocompleteOption {
    id: number | string;
    label: string;
}

interface AutocompleteProps {
    options: AutocompleteOption[];
    value: number | string | undefined;
    onChange: (id: number | string | undefined) => void;
    placeholder?: string;
    label?: string;
    icon?: React.ReactNode;
    required?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Pesquisar...',
    label,
    icon,
    required = false,
    className = "",
    style
}) => {
    const [searchTerm, setSearchText] = useState('');
    const [show, setShow] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Encontra o label da opção selecionada
    const selectedOption = options.find(opt => opt.id === value);

    useEffect(() => {
        if (!show) {
            setSearchText('');
        }
    }, [show]);

    // Fecha ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShow(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 100); // Limite visual para performance

    const handleSelect = (id: number | string) => {
        onChange(id);
        setShow(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(undefined);
    };

    return (
        <div className={`autocomplete-container ${className}`} ref={containerRef} style={{ position: 'relative' }}>
            {label && <Form.Label className="form-premium-label">{label}</Form.Label>}
            
            <InputGroup 
                className={`rounded-12 overflow-hidden border ${show ? 'border-primary shadow-sm' : ''}`}
                onClick={() => setShow(true)}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            >
                {icon && (
                    <InputGroup.Text className="bg-light border-0">
                        {icon}
                    </InputGroup.Text>
                )}
                
                <div className="form-control border-0 d-flex align-items-center justify-content-between py-2" style={{ minHeight: '45px' }}>
                    <span className={selectedOption ? 'text-dark fw-medium' : 'text-muted'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    {selectedOption && (
                        <X 
                            size={16} 
                            className="text-muted hover-text-danger" 
                            onClick={handleClear}
                            style={{ cursor: 'pointer' }}
                        />
                    )}
                </div>
            </InputGroup>

            {show && (
                <div className="autocomplete-dropdown shadow-lg border rounded-12 mt-1 bg-white" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1050,
                    maxHeight: '300px',
                    overflowY: 'auto'
                }}>
                    <div className="p-2 border-bottom sticky-top bg-white">
                        <InputGroup size="sm" className="bg-light rounded-8 overflow-hidden border">
                            <InputGroup.Text className="bg-transparent border-0"><Search size={14} /></InputGroup.Text>
                            <Form.Control
                                autoFocus
                                className="bg-transparent border-0 shadow-none"
                                placeholder="Digite para filtrar..."
                                value={searchTerm}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </InputGroup>
                    </div>
                    
                    <div className="py-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-4 text-center text-muted small italic">
                                Nenhum resultado encontrado.
                            </div>
                        ) : (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt.id}
                                    className={`px-3 py-2 cursor-pointer autocomplete-item ${opt.id === value ? 'bg-primary-light text-primary' : ''}`}
                                    onClick={() => handleSelect(opt.id)}
                                >
                                    <span className="small fw-bold">{opt.label}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .autocomplete-item:hover {
                    background-color: #f8fafc;
                }
                .bg-primary-light { background-color: rgba(93, 135, 255, 0.1); }
                .hover-text-danger:hover { color: #fa896b !important; }
                .rounded-12 { border-radius: 12px !important; }
                .rounded-8 { border-radius: 8px !important; }
            `}</style>
        </div>
    );
};

export default Autocomplete;
