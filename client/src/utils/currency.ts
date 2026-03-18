export function formatCurrencyLKR(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return 'රු0.00';
  }

  return value.toLocaleString('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

