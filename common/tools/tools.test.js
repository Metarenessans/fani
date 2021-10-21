import { Tools, Tool } from "."

describe("Сортировка", () => {
  /** @type {Tools.sort} */
  const func = Tools.sort;

  test("Сортирует инструменты в алфавитном порядке", () => {
    expect( func(["a", "b", "c"]) ).toEqual( ["a", "b", "c"] );
    expect( func(["c", "a", "b"]) ).toEqual( ["a", "b", "c"] );
    expect( func(["b", "a", "c"]) ).toEqual( ["a", "b", "c"] );
  
    expect( func(["ab", "aa", "ac"]) ).toEqual( ["aa", "ab", "ac"] );
    expect( func(["aab", "aca", "abc"]) ).toEqual( ["aab", "abc", "aca"] );
  
    expect( func(["Ab", "aa", "Bb", "ba"]) ).toEqual( ["aa", "Ab", "ba", "Bb"] );
    
    expect( func(["5", "2", "0", "9"]) ).toEqual( ["0", "2", "5", "9"] );
  });
  
  test("Числа имеют приоритет в сортировке (идут первыми)", () => {
    expect( func(["1", "3", "1a"]) ).toEqual( ["1", "1a", "3"] );
    expect( func(["AFLT", "3 MMM", "4 Weird Name"]) ).toEqual( ["3 MMM", "4 Weird Name", "AFLT"] );
  });

  test("Работает на абстрактном примере", () => {
    expect( Tools.sort([
      "American Airlines",
      "AbbVie, Inc.",
      "ABIOMED, Inc.",
      "Abbot Laboratories",
    ] )).toEqual( [
      "Abbot Laboratories",
      "AbbVie, Inc.",
      "ABIOMED, Inc.",
      "American Airlines",
    ] );
  });
  
  test("Сортирует по дате в конце фьючерсов", () => {  
    expect( func([
      "Si-12.20",
      "Si-12.21",
      "Si-3.21",
      "Si-3.22",
      "Si-6.21",
      "Si-9.21",
      "Si-9.22",
    ]) ).toEqual( [
      "Si-12.20",
      
      "Si-3.21",
      "Si-6.21",
      "Si-9.21",
      "Si-12.21",
  
      "Si-3.22",
      "Si-9.22",
    ] );
    
    expect( func([
      "BR-11.21",
      "BR-1.21",
      "BR-10.21",
      "BR-12.20",
      "BR-6.20",
      "BR-2.21",
      "BR-3.21",
      "BR-4.21",
      "BR-5.21",
      "BR-6.21",
      "BR-7.21",
      "BR-8.21",
      "BR-9.21",
    ]) ).toEqual( [
      "BR-6.20",
      "BR-12.20",
      "BR-1.21",
      "BR-2.21",
      "BR-3.21",
      "BR-4.21",
      "BR-5.21",
      "BR-6.21",
      "BR-7.21",
      "BR-8.21",
      "BR-9.21",
      "BR-10.21",
      "BR-11.21",
    ] );
    
    expect( func([
      "A-2.21",
      "A-1.20",
      "A-3.21",
      "A-2.20",
      "A-1.21",
      "A-3.20",
    ]) ).toEqual( [
      "A-1.20",
      "A-2.20",
      "A-3.20",
      "A-1.21",
      "A-2.21",
      "A-3.21",
    ] );
  });
})

describe("Нахождение индекса по коду", () => {
  // TODO: разбить на разные группы и описать
  test("Работает в разных кейсах", () => {
    const codes = [
      "MMM",
      "Si-3.21",
      "Si-6.21",
      "Si-9.21",
      "Si-12.21",
      "BR-12.20",
      "BR-1.21",
      "BR-3.21",
      "BR-6.21",
      "BRU1",
      "BRV1",
      "BRX1",
    ];

    const tools = codes.map(code => Tool.fromObject({ code }));
  
    let result;
  
    // Инструмент существует
    result = expect(Tools.getIndexByCode("BR-1.21", tools));
    result.not.toEqual(-1);
    result.toEqual(6);
  
    // Инструмента не существует
    result = expect(Tools.getIndexByCode("XXX", tools));
    result.not.toEqual(-1);
    result.toEqual(0);
  
    // Инструмент истек и мы может взять следующий по списку
    result = expect(Tools.getIndexByCode("BR-2.21", tools));
    result.not.toEqual(-1);
    result.toEqual(7);
  
    result = expect(Tools.getIndexByCode("Si-5.21", tools));
    result.not.toEqual(-1);
    result.toEqual(2);
  
    result = expect(Tools.getIndexByCode("BR-6.21", tools));
    result.not.toEqual(-1);
    result.toEqual(8);
    
    result = expect(Tools.getIndexByCode("BRQ1", tools));
    result.not.toEqual(-1);
    result.toEqual(codes.indexOf("BRU1"));
  
    result = expect(Tools.getIndexByCode("BRU1", tools));
    result.not.toEqual(-1);
    result.toEqual(codes.indexOf("BRU1"));
  
    result = expect(Tools.getIndexByCode("BRX1", tools,));
    result.not.toEqual(-1);
    result.toEqual(codes.indexOf("BRX1"));
  });
})

test("Набор заготовленных инструментов", () => {
  const tools = Tools.createArray();
  expect(tools.length).toEqual(4);
})