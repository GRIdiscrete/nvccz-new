export const formatCurrencyFactory = (currency: string) => (amount: number) =>
    amount.toLocaleString(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  
  export const formatShort = (fmt: (n: number) => string) => (amount: number) => {
    if (Math.abs(amount) >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
    if (Math.abs(amount) >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
    return fmt(amount);
  };
  
  export const formatMonthLabel = (value?: string) => {
    if (!value) return '';
    try {
      const [year, month] = value.split('-');
      if (!year || !month) return value;
      const d = new Date(parseInt(year), parseInt(month) - 1);
      if (isNaN(d.getTime())) return value;
      return d.toLocaleString('default', { month: 'short', year: 'numeric' });
    } catch {
      return value;
    }
  };
  