import { request } from "./api/httpClient.js";
import { REQUESTS, TARGET_CURRENCY } from "./config.js";
import { Source1Adapter } from "./adapters/Source1Adapter.js";
import { Source2Adapter } from "./adapters/Source2Adapter.js";
import { calculateDailyRevenue } from "./services/revenueCalculator.js";
import { parseRates } from "./adapters/ratesAdapter.js";
import "./style.css";

const app = document.querySelector("#app");
const formatMoney = (value, currency) => new Intl.NumberFormat("ru-RU", {
  style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format(value);

function renderShell() {
  app.innerHTML = `
    <main class="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div class="mx-auto max-w-6xl">
        <header class="flex items-center justify-between border-b border-slate-200/80 pb-6">
          <a class="flex items-center gap-3 text-slate-900 no-underline" href="#">
            <span class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-200">₿</span>
            <span class="text-sm font-semibold tracking-tight">DAYBOOK <span class="font-normal text-slate-400">/ Finance</span></span>
          </a>
          <span class="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:inline-flex"><i class="h-1.5 w-1.5 rounded-full bg-emerald-500"></i> Живые данные</span>
        </header>
        <section class="py-10 sm:py-14">
          <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p class="mb-3 text-xs font-semibold uppercase tracking-[.2em] text-indigo-600">Финансовая сводка</p><h1 class="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Выручка за день</h1><p class="mt-2 text-sm text-slate-500">Собрали платежи из двух источников в одной сводке.</p></div>
            <div class="text-sm text-slate-500">Обновлено <time id="updated-at">—</time></div>
          </div>
          <div id="error" class="mb-6 hidden rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800" role="alert"><div class="flex gap-3"><span class="text-lg">!</span><div><p class="font-semibold">Не удалось загрузить сводку</p><p id="error-message" class="mt-1"></p><button id="retry" class="mt-3 font-semibold underline underline-offset-4">Попробовать снова</button></div></div></div>
          <div id="loading" class="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">Загружаем платежи и курсы валют…</div>
          <div id="results" class="hidden">
            <article class="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl shadow-slate-300/50 sm:p-10">
              <div class="absolute -right-20 -top-36 h-96 w-96 rounded-full border border-white/10"></div><div class="absolute -right-8 -top-24 h-72 w-72 rounded-full border border-white/10"></div>
              <div class="relative"><div class="flex items-center gap-2 text-sm text-slate-300"><span class="grid h-7 w-7 place-items-center rounded-lg bg-white/10">↗</span> Общий итог · ${TARGET_CURRENCY}</div><p id="total" class="mt-7 text-4xl font-semibold tracking-tight sm:text-6xl"></p><div class="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-5 text-sm text-slate-300"><span>Период <b class="ml-2 font-medium text-white">Сегодня</b></span><span>Источников <b class="ml-2 font-medium text-white">2</b></span><span>Расчёт <b class="ml-2 font-medium text-white">По актуальным курсам</b></span></div></div>
            </article>
            <div class="mt-7 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
              <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"><div class="flex items-start justify-between"><div><p class="text-xs font-semibold uppercase tracking-[.16em] text-slate-400">Разбивка</p><h2 class="mt-1 text-lg font-semibold text-slate-900">Суммы по валютам</h2></div><span class="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-500">Оригинальные суммы</span></div><div id="currency-list" class="mt-6 divide-y divide-slate-100"></div></section>
              <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"><div class="flex items-start justify-between"><div><p class="text-xs font-semibold uppercase tracking-[.16em] text-slate-400">FX рынок</p><h2 class="mt-1 text-lg font-semibold text-slate-900">Курсы валют</h2></div><span class="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">База USD</span></div><p class="mt-2 text-xs text-slate-400">За 1 USD · по данным сервиса курсов</p><div id="rate-list" class="mt-5 divide-y divide-slate-100"></div></section>
            </div>
          </div>
        </section>
        <footer class="border-t border-slate-200/80 py-5 text-xs text-slate-400">Данные обновляются при каждом запросе страницы <span class="float-right">DAYBOOK © ${new Date().getFullYear()}</span></footer>
      </div>
    </main>`;
  document.querySelector("#retry").addEventListener("click", loadData);
}

function showError(error) {
  document.querySelector("#loading").classList.add("hidden");
  document.querySelector("#results").classList.add("hidden");
  document.querySelector("#error").classList.remove("hidden");
  document.querySelector("#error-message").textContent = error instanceof Error ? error.message : "Произошла неизвестная ошибка.";
}

async function loadData() {
  document.querySelector("#error").classList.add("hidden");
  document.querySelector("#results").classList.add("hidden");
  document.querySelector("#loading").classList.remove("hidden");
  try {
    const [source1, source2, ratesData] = await Promise.all([
      request(REQUESTS.finance1), request(REQUESTS.finance2), request(REQUESTS.rates),
    ]);
    const rates = parseRates(ratesData);
    const result = calculateDailyRevenue(
      [new Source1Adapter(source1), new Source2Adapter(source2)], rates, TARGET_CURRENCY,
    );
    document.querySelector("#total").textContent = formatMoney(result.total, result.currency);
    document.querySelector("#currency-list").innerHTML = Object.entries(result.totalsByCurrency).sort(([a], [b]) => a.localeCompare(b)).map(([currency, amount]) => `
      <div class="flex items-center justify-between py-4"><div class="flex items-center gap-3"><span class="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-700">${currency}</span><div><p class="text-sm font-medium text-slate-800">${currency}</p><p class="text-xs text-slate-400">Поступления</p></div></div><p class="text-sm font-semibold tabular-nums text-slate-900">${formatMoney(amount, currency)}</p></div>`).join("") || '<p class="py-6 text-sm text-slate-500">Платежей за период нет.</p>';
    const usedCurrencies = [...new Set([...Object.keys(result.totalsByCurrency), TARGET_CURRENCY])].sort();
    document.querySelector("#rate-list").innerHTML = usedCurrencies.map((currency) => `
      <div class="flex items-center justify-between py-3"><span class="flex items-center gap-2 text-sm font-medium text-slate-700"><span class="h-2 w-2 rounded-full ${currency === TARGET_CURRENCY ? "bg-indigo-500" : "bg-emerald-500"}"></span>${currency}</span><span class="font-mono text-sm tabular-nums text-slate-600">${Number(rates[currency]).toLocaleString("ru-RU", { maximumFractionDigits: 5 })}</span></div>`).join("");
    document.querySelector("#updated-at").textContent = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(new Date());
    document.querySelector("#loading").classList.add("hidden");
    document.querySelector("#results").classList.remove("hidden");
  } catch (error) {
    showError(error);
  }
}

renderShell();
loadData();
