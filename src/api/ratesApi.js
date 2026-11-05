import { request } from "./httpClient.js";
import { RATES_URL } from "../config.js";

// Возвращает { USD: 1, EUR: 0.92, ... } — единиц валюты за 1 USD
export async function fetchRates() {
  const data = await request(RATES_URL);

  if (data.result !== "success" || !data.rates) {
    throw new Error("Некорректный ответ сервиса курсов валют");
  }
  return data.rates;
}