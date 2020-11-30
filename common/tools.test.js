import { Tools } from "./tools"

const func = Tools.sort;

test("properly sorts tools in alphabetical order", () => {

  expect( func(["a", "b", "c"]) ).toEqual( ["a", "b", "c"] );
  expect( func(["c", "a", "b"]) ).toEqual( ["a", "b", "c"] );
  expect( func(["b", "a", "c"]) ).toEqual( ["a", "b", "c"] );

  expect( func(["ab", "aa", "ac"]) ).toEqual( ["aa", "ab", "ac"] );
  expect( func(["aab", "aca", "abc"]) ).toEqual( ["aab", "abc", "aca"] );

  expect( func(["Ab", "aa", "Bb", "ba"]) ).toEqual( ["aa", "Ab", "ba", "Bb"] );
  
  expect( func(["5", "2", "0", "9"]) ).toEqual( ["0", "2", "5", "9"] );
});

test("numbers always go first", () => {

  expect( func(["1", "3", "1a"]) ).toEqual( ["1", "1a", "3"] );
  expect( func(["AFLT", "3 MMM", "4 Weird Name"]) ).toEqual( ["3 MMM", "4 Weird Name", "AFLT"] );
  
});

test("works in a real-word example", () => {
  
  expect( func([
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