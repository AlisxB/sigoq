export const keepOnlyNumbers = (text: string): string => {
    return text.replace(/\D/g, '');
};

export const maskCPF = (text: string): string => {
    let value = keepOnlyNumbers(text);
    if (value.length > 11) value = value.slice(0, 11);
    return value
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
};

export const maskCNPJ = (text: string): string => {
    let value = keepOnlyNumbers(text);
    if (value.length > 14) value = value.slice(0, 14);
    return value
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2');
};

export const maskCPFOrCNPJ = (text: string): string => {
    const raw = keepOnlyNumbers(text);
    if (raw.length <= 11) {
        return maskCPF(text);
    }
    return maskCNPJ(text);
};

export const maskPhone = (text: string): string => {
    let value = keepOnlyNumbers(text);
    if (value.length > 11) value = value.slice(0, 11);

    // (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (value.length > 10) {
        return value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 6) {
        return value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
        return value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (value.length > 0) {
        return value.replace(/^(\d*)/, '($1');
    }
    return value;
};

export const maskCurrency = (text: string | number): string => {
    let value = typeof text === 'string' ? text : text.toFixed(2);
    value = keepOnlyNumbers(value);

    if (!value) return '';

    const num = parseInt(value, 10) / 100;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
    }).format(num);
};

export const unmaskCurrency = (text: string): string => {
    let value = keepOnlyNumbers(text);
    if (!value) return '0.00';
    return (parseInt(value, 10) / 100).toFixed(2);
};

export const maskCEP = (text: string): string => {
    let value = keepOnlyNumbers(text);
    if (value.length > 8) value = value.slice(0, 8);
    return value.replace(/^(\d{5})(\d)/, '$1-$2');
};
