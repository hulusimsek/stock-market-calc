const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
};

const applyDynamicColor = (input) => {
    if (!input.classList.contains('color-dynamic')) return;
    const val = parseFloat(input.value);
    input.classList.remove('text-success', 'text-danger');
    if (val > 0) input.classList.add('text-success');
    else if (val < 0) input.classList.add('text-danger');
};
