function sum(number) {
  let total = 0;

  function internalSum(nextNumber) {
    if (nextNumber) {
      total += nextNumber;
      return internalSum;
    } else {
      return total;
    }
  }

  return internalSum(number);


}

const isValid = (1 + 2 + 3 + 4 + 5 + 6) === sum(1)(2)(3)(4)(5)(6)();
console.log(isValid);