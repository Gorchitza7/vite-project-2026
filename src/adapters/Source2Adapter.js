import { normalizeCurrency } from "../utils/normalizeCurrency.js";

// Источник №2: массив строк "300 USD"
export class Source2Adapter {
  constructor(source) {
    this.source = source;
  }

  getTransactions() {
    return (this.source ?? []).map((str) => this.parse(str));
  }

  parse(str) {
    const match = /^\s*(-?\d+(?:[.,]\d+)?)\s+([A-Za-z]{3})\s*$/.exec(str);
    if (!match) {
      throw new Error(`Некорректный формат записи: "${str}"`);
    }
    return {
      amount: parseFloat(match[1].replace(",", ".")),
      currency: normalizeCurrency(match[2]),
    };
  }
}