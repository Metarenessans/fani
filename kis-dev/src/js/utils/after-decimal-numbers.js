export default function afterDecimalNumbersnumber(number) {

  let result = (number.toString().includes('.')) ? (number.toString().split('.').pop().length) : (0);
  
  return result
}

