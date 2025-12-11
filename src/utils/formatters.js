export const formatCurrency = (num) => {
    if (!num && num !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
};

export const formatNumber = (num) => {
    if (!num && num !== 0) return 'N/A';
    return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercent = (num, decimals = 2) => {
    if (!num && num !== 0) return 'N/A';
    return `${parseFloat(num).toFixed(decimals)}%`;
};

export const formatNumberInput = (value) => {
    if (!value) return '';
    const stripped = value.toString().replace(/,/g, '');
    if (isNaN(stripped) || stripped === '') return value;
    const numValue = parseFloat(stripped);
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(numValue);
};

export const stripCommas = (value) => {
    return value ? value.replace(/,/g, '') : '';
};
