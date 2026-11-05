import './style.css'
import { fetchFinance1, fetchFinance2 } from "./api/financeApi.js";
import { fetchRates } from "./api/ratesApi.js";
import { Source1Adapter } from "./adapters/Source1Adapter.js";
import { Source2Adapter } from "./adapters/Source2Adapter.js";
import { calculateDailyRevenue } from "./services/revenueCalculator.js";
import { TARGET_CURRENCY } from "./config.js";

async function main() {
  const [source1, source2, rates] = await Promise.all([
    fetchFinance1(),
    fetchFinance2(),
    fetchRates(),
  ]);

  console.log("Источник 1:", source1);
  console.log("Источник 2:", source2);

  const result = calculateDailyRevenue(
    [new Source1Adapter(source1), new Source2Adapter(source2)],
    rates,
    TARGET_CURRENCY
  );

  console.log("Суммы по валютам:", result.totalsByCurrency);
  console.log(`Итого: ${result.total} ${result.currency}`);

  const app = document.querySelector("#app");
  if (app) {
    app.textContent = `Выручка за день: ${result.total} ${result.currency}`;
  }
}

main().catch((error) => console.error("Ошибка:", error));