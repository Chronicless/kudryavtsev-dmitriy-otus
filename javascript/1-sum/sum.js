function sum(number) {
  let total = 0;

  function internalSum(nextNumber) {
    if (typeof nextNumber !== 'undefined') {
      total += nextNumber;
      return internalSum;
    } else {
      return total;
    }
  }

  return internalSum(number);


}

const isValid = (1 + 2 + 3 + 4 + 5 + 6 + 0 + 1) === sum(1)(2)(3)(4)(5)(6)(0)(1)();
console.log(isValid);