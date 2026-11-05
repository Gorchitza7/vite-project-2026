// Клиент: знает только про getTransactions() и курсы валют.
// 1) суммируем отдельно по каждой валюте (валюты не смешиваются)
// 2) переводим каждую сумму в целевую валюту и складываем
export function calculateDailyRevenue(adapters, rates, target = "USD") {
  const all = adapters.flatMap((adapter) => adapter.getTransactions());

  // Суммы по валютам — в центах, чтобы избежать ошибок float
  const centsByCurrency = {};
  for (const { amount, currency } of all) {
    centsByCurrency[currency] =
      (centsByCurrency[currency] ?? 0) + Math.round(amount * 100);
  }

  const totalsByCurrency = {};
  let totalCents = 0;

  for (const [currency, cents] of Object.entries(centsByCurrency)) {
    if (!rates[currency] || !rates[target]) {
      throw new Error(`Нет курса для валюты: ${currency} или ${target}`);
    }
    totalsByCurrency[currency] = cents / 100;
    // rates — единиц валюты за 1 USD: X -> USD -> target
    totalCents += Math.round((cents / rates[currency]) * rates[target]);
  }

  return { total: totalCents / 100, currency: target, totalsByCurrency };
}