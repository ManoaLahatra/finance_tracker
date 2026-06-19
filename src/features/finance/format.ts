export const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

export const formatPercent = (progress: number | null): string => {
    if (progress === null) {
        return 'No limit';
    }

    return `${Math.round(progress * 100)}%`;
};
