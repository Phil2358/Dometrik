const EUROPEAN_LOCALE = 'de-DE';
const EURO_SYMBOL = '\u20AC';
export function formatCurrency(value, maximumFractionDigits = 0) {
    const formattedNumber = new Intl.NumberFormat(EUROPEAN_LOCALE, {
        minimumFractionDigits: 0,
        maximumFractionDigits,
    }).format(value);
    return `${EURO_SYMBOL}${formattedNumber}`;
}
export function formatNumber(value, maximumFractionDigits = 0) {
    return new Intl.NumberFormat(EUROPEAN_LOCALE, {
        minimumFractionDigits: 0,
        maximumFractionDigits,
    }).format(value);
}
export function formatDecimal(value, fractionDigits = 2) {
    return new Intl.NumberFormat(EUROPEAN_LOCALE, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(value);
}
export function formatPercent(value, fractionDigits = 0) {
    const formattedNumber = new Intl.NumberFormat(EUROPEAN_LOCALE, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(value);
    return `${formattedNumber} %`;
}
