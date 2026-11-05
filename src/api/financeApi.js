import { API_BASE, API_KEY } from "../config.js";

async function request(path) {
  const response = await fetch(`${API_BASE}/${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
  });
  if (!response.ok) {
    throw new Error(`Ошибка запроса ${path}: ${response.status}`);
  }
  return response.json();
}

export const fetchFinance1 = () => request("finance1");
export const fetchFinance2 = () => request("finance2");