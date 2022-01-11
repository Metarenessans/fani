import fetch from "./fetch"
import fetchBonds from "./fetch-bonds"

test("Работает", async () => {
  const response = await fetch("getBonds");

  const bonds = await fetchBonds();
  expect(bonds).toBeDefined();
  expect(bonds).toBeInstanceOf(Array);
  expect(bonds.length).toBeGreaterThan(0);

  for (let bond of bonds) {
    const ref = response.data.find(ref => ref.name === bond.name);

    expect(bond).toHaveProperty("name");
    expect(typeof bond.name).toBe("string");
    expect(bond.name.length).toBeGreaterThan(0);
    
    expect(bond).toHaveProperty("rate");
    expect(typeof bond.rate).toBe("number");
    expect(bond.rate).not.toBeNaN();
    expect(bond.rate).toEqual(Number(ref.yield));
  }
});