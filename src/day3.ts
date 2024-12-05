const sample =
  "xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))";

const regex = /mul\((\d+),(\d+)\)/g;

function get_pairs(input: string): Array<[number, number]> {
  const raw_list = Array.from(input.matchAll(regex));

  return raw_list.map(([_, first, second]) => [Number(first), Number(second)]);
}

function get_sum(array: Array<[number, number]>): number {
  return array.reduce((acc, [first, second]) => acc + first * second, 0);
}

const input = Deno.readTextFileSync("../inputs/day3.txt").split("\n").join();
const input_pairs = get_pairs(input);
const input_sum = get_sum(input_pairs);

console.log(`First challenge ${input_sum}`);

// second part

const deleter = /don't\(\).*?do\(\)/g;
const redacted_input = input.replaceAll(deleter, "DELETED");
const redacted_sum = get_sum(get_pairs(redacted_input));

console.log(`Second challenge ${redacted_sum}`);
