import { normalizeCurrency } from "../utils/normalizeCurrency.js";

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