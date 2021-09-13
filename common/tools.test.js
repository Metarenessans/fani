import { Tools } from "./tools"

const sort = Tools.sort;

test("properly sorts tools in alphabetical order", () => {

  expect( sort(["a", "b", "c"]) ).toEqual( ["a", "b", "c"] );
  expect( sort(["c", "a", "b"]) ).toEqual( ["a", "b", "c"] );
  expect( sort(["b", "a", "c"]) ).toEqual( ["a", "b", "c"] );

  expect( sort(["ab", "aa", "ac"]) ).toEqual( ["aa", "ab", "ac"] );
  expect( sort(["aab", "aca", "abc"]) ).toEqual( ["aab", "abc", "aca"] );

  expect( sort(["Ab", "aa", "Bb", "ba"]) ).toEqual( ["aa", "Ab", "ba", "Bb"] );
  
  expect( sort(["5", "2", "0", "9"]) ).toEqual( ["0", "2", "5", "9"] );
});

test("numbers always go first", () => {

  expect( sort(["1", "3", "1a"]) ).toEqual( ["1", "1a", "3"] );
  expect( sort(["AFLT", "3 MMM", "4 Weird Name"]) ).toEqual( ["3 MMM", "4 Weird Name", "AFLT"] );
  
});

test("sorting works in a real-word example", () => {
  
  expect( sort([
    "American Airlines",
    "AbbVie, Inc.",
    "ABIOMED, Inc.",
    "Abbot Laboratories",
  ]) ).toEqual( [
    "Abbot Laboratories",
    "AbbVie, Inc.",
    "ABIOMED, Inc.",
    "American Airlines",
  ] );

});

test("properly sorts numbers at the end", () => {
  
  expect( sort([
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
  
  expect( sort([
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
  
  expect( sort([
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

test("properly finds tool index by code", () => {
  
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
  const tools = codes.map(code => Tools.create({ code }));

  let result;

  // Инструмент существует
  result = expect(
    Tools.getToolIndexByCode( tools, "BR-1.21" )
  );
  result.toEqual(6);
  result.not.toEqual(-1);

  // Инструмента не существует
  result = expect(
    Tools.getToolIndexByCode( tools, "XXX" )
  );
  result.toEqual(0);
  result.not.toEqual(-1);

  // Инструмент истек и мы может взять следующий по списку
  result = expect(
    Tools.getToolIndexByCode( tools, "BR-2.21" )
  );
  result.toEqual(7);
  result.not.toEqual(-1);

  result = expect(
    Tools.getToolIndexByCode( tools, "Si-5.21" )
  );
  result.toEqual(2);
  result.not.toEqual(-1);

  result = expect(
    Tools.getToolIndexByCode( tools, "BR-6.21" )
  );
  result.toEqual(8);
  result.not.toEqual(-1);
  
  result = expect( Tools.getToolIndexByCode(tools, "BRQ1") );
  result.toEqual(codes.indexOf("BRU1"));
  result.not.toEqual(-1);

  result = expect( Tools.getToolIndexByCode(tools, "BRU1") );
  result.toEqual(codes.indexOf("BRU1"));
  result.not.toEqual(-1);

  result = expect( Tools.getToolIndexByCode(tools, "BRX1") );
  result.toEqual(codes.indexOf("BRX1"));
  result.not.toEqual(-1);

});
// ~~~