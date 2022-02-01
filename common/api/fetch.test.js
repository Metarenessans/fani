import { ajax } from "jquery";
import fetch from "./fetch";

test("Возвращает ответ", async () => {
  const response = await fetch("getAuthInfo");
  expect(response).toBeDefined();
  expect(response).toBeInstanceOf(Object);
});

test("Выбрасывает ошибку, если произошел CORS", async () => {
  const method = "getInvestorInfo";
  const response = await ajax(`https://fani144.ru/local/php_interface/s1/ajax/?method=${method}`);
  const json = JSON.parse(response);
  expect(json).toBeDefined();
  expect(json.error).toEqual(true);

  const promise = fetch(method);
  await expect(promise).rejects.toBeDefined();
  await expect(promise).rejects.toMatch(json.message);
});
