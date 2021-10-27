import fetchBonds from "./fetch-bonds"

test("Работает", async () => {
  const response = await fetchBonds();
  expect(response).toBeDefined();
  expect(response).toBeInstanceOf(Array);

  for (let obj of response) {
    expect(obj).toHaveProperty("name");
    expect(typeof obj.name).toBe("string");
    expect(obj.name.length).toBeGreaterThan(0);
    
    expect(obj).toHaveProperty("rate");
    expect(typeof obj.rate).toBe("number");
    expect(obj.rate).not.toBeNaN();
  }
});