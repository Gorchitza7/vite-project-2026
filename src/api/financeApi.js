import { request } from "./httpClient.js";
import { API_BASE, API_KEY } from "../config.js";

const options = { headers: { "x-api-key": API_KEY } };

export const fetchFinance1 = () => request(`${API_BASE}/finance1`, options);
export const fetchFinance2 = () => request(`${API_BASE}/finance2`, options);