import { normalizeCurrency } from "../utils/normalizeCurrency.js";

// Источник №1: объект { transactions: [{ type, amount, currency }] }
export class Source1Adapter {
  constructor(source) {
    this.source = source;
  }

  getTransactions() {
    return (this.source?.transactions ?? [])
      .filter((t) => t.type === "paid")
      .map(({ amount, currency }) => ({
        amount,
        currency: normalizeCurrency(currency),
      }));
  }
}