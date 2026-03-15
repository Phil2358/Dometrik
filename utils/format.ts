const EUROPEAN_LOCALE = 'de-DE';
const EURO_SYMBOL = '\u20AC';

export function formatCurrency(value: number, maximumFractionDigits = 0): string {
  const formattedNumber = new Intl.NumberFormat(EUROPEAN_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);

  return `${EURO_SYMBOL}${formattedNumber}`;
}

export function formatNumber(value: number, maximumFractionDigits = 0): string {
  return new Intl.NumberFormat(EUROPEAN_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}

export function formatDecimal(value: number, fractionDigits = 2): string {
  return new Intl.NumberFormat(EUROPEAN_LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatPercent(value: number, fractionDigits = 0): string {
  const formattedNumber = new Intl.NumberFormat(EUROPEAN_LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);

  return `${formattedNumber} %`;
}
