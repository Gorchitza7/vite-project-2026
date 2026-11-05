export function normalizeCurrency(currency) {
  if (typeof currency !== "string" || currency.trim() === "") {
    throw new Error(`Некорректная валюта: ${JSON.stringify(currency)}`);
  }
  return currency.trim().toUpperCase();
}