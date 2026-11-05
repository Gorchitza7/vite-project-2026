import { RATES_URL } from "../config.js";

// Возвращает { USD: 1, EUR: 0.92, ... } — сколько единиц валюты в 1 USD
export async function fetchRates() {
  const response = await fetch(RATES_URL);
  if (!response.ok) {
    throw new Error(`Ошибка получения курсов: ${response.status}`);
  }
  const data = await response.json();
  if (data.result !== "success" || !data.rates) {
    throw new Error("Некорректный ответ сервиса курсов валют");
  }
  return data.rates;
}