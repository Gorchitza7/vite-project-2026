const API_BASE = "https://cpa-server-vtel.onrender.com/api";
const authOptions = { headers: { "x-api-key": "prodcpakey333" } };

export const REQUESTS = {
  finance1: { url: `${API_BASE}/finance1`, options: authOptions },
  finance2: { url: `${API_BASE}/finance2`, options: authOptions },
  rates: { url: "https://open.er-api.com/v6/latest/USD", options: {} },
};

export const TARGET_CURRENCY = "USD";