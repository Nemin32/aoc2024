const sample = `7 6 4 2 1
1 2 7 8 9
9 7 6 2 1
1 3 2 4 5
8 6 4 4 1
1 3 6 7 9`;

function split_to_lists(input: string): number[][] {
  return input.split("\n").map((line) => line.split(" ").map((n) => Number(n)));
}

function check_valid(array: number[]): boolean {
  const is_ascending = array[0] < array[1];

  for (let i = 1; i < array.length; i++) {
    const diff = (array[i] - array[i - 1]) * (is_ascending ? 1 : -1);

    if (diff < 1 || diff > 3) {
      return false;
    }
  }

  return true;
}

const sample_list = split_to_lists(sample);
for (const list of sample_list) {
  console.log(check_valid(list) ? "SAFE" : "UNSAFE");
}

const input = Deno.readTextFileSync("../inputs/day2.txt");
const input_list = split_to_lists(input);

const checks = input_list.map((line) => check_valid(line)).filter((e) => e);
console.log(`First challenge: ${checks.length}`);

// Second part

function check_valid_with_restart(array: number[]): boolean {
  const is_ascending = array[0] < array[1];

  for (let i = 1; i < array.length; i++) {
    const diff = (array[i] - array[i - 1]) * (is_ascending ? 1 : -1);

    if (diff < 1 || diff > 3) {
      for (let o = 0; o < array.length; o++) {
        const new_array = array.toSpliced(o, 1);
        if (check_valid(new_array)) {
          return true;
        }
      }

      return false;
    }
  }

  return true;
}

const checks_with_restart = input_list
  .map((line) => check_valid_with_restart(line))
  .filter((e) => e);

console.log(`Second challenge: ${checks_with_restart.length}`);
