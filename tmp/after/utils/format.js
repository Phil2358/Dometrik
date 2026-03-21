"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.formatNumber = formatNumber;
exports.formatDecimal = formatDecimal;
exports.formatPercent = formatPercent;
const EUROPEAN_LOCALE = 'de-DE';
const EURO_SYMBOL = '\u20AC';
function formatCurrency(value, maximumFractionDigits = 0) {
    const formattedNumber = new Intl.NumberFormat(EUROPEAN_LOCALE, {
        minimumFractionDigits: 0,
        maximumFractionDigits,
    }).format(value);
    return `${EURO_SYMBOL}${formattedNumber}`;
}
function formatNumber(value, maximumFractionDigits = 0) {
    return new Intl.NumberFormat(EUROPEAN_LOCALE, {
        minimumFractionDigits: 0,
        maximumFractionDigits,
    }).format(value);
}
function formatDecimal(value, fractionDigits = 2) {
    return new Intl.NumberFormat(EUROPEAN_LOCALE, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(value);
}
function formatPercent(value, fractionDigits = 0) {
    const formattedNumber = new Intl.NumberFormat(EUROPEAN_LOCALE, {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(value);
    return `${formattedNumber} %`;
}
