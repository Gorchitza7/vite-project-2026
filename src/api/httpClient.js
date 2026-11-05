export async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Ошибка запроса ${url}: ${response.status}`);
  }

  return response.json();
}