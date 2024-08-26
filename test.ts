let arr = [0, 1, 2, 10, 18, 19, 20];

const handleClick = (index: number, isShift: boolean) => {
  if (isShift) {
    const lastClicked = arr[arr.length - 1];

    const numbersBetween = getNumbersBetween(lastClicked, index);

    const isAdding = isAdd(arr, index);

    console.log('isAdding', isAdding);
    if (isAdding) {
      arr = Array.from(new Set([...arr, ...numbersBetween]));
      return;
    }

    if (!isAdding) {
      arr = arr.filter((n) => !numbersBetween.includes(n));
      return;
    }
  }

  arr.push(index);
  return;
};

const isAdd = (arr: number[], shiftClickIndex: number) => {
  const lastClicked = arr[arr.length - 1];

  const numbersBetween = [lastClicked, ...getNumbersBetween(lastClicked, shiftClickIndex)];

  const numbersBetweenSet = new Set(numbersBetween);

  return !arrayHasAllSetElements(arr, numbersBetweenSet);
};

function arrayHasAllSetElements(array, set) {
  // Convert the array to a Set for faster lookups
  const arraySet = new Set(array);

  for (let item of set) {
    if (!arraySet.has(item)) {
      return false; // If any item in the Set is not found in the arraySet, return false
    }
  }
  return true; // All items in the Set are found in the arraySet
}

function getNumbersBetween(a: number, b: number) {
  //a is exclusive, b is inclusive
  let numbers: number[] = [];

  if (a < b) {
    for (let i = a + 1; i <= b; i++) {
      numbers.push(i);
    }
  }

  if (a > b) {
    for (let i = a - 1; i >= b; i--) {
      numbers.push(i);
    }
  }

  return numbers;
}

handleClick(30, true);
console.log(arr);

handleClick(25, true);
console.log(arr);
