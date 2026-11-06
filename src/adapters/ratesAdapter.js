// { result: "success", rates: {...} } -> { USD: 1, EUR: 0.92 }
export function parseRates(data) {
  if (data?.result !== "success" || !data.rates) {
    throw new Error("Некорректный ответ сервиса курсов валют");
  }
  return data.rates;
}