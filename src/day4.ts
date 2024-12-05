const search = ["X", "M", "A", "S"];

const sample = `MMMSXXMASM
MSAMXMSMSA
AMXSXMAAMM
MSAMASMSMX
XMASAMXAMM
XXAMMXXAMA
SMSMSASXSS
SAXAMASAAA
MAMMMXMMMM
MXMXAXMASX`;

function split_list(input: string): string[][] {
  return input.split("\n").map((line) => line.split(""));
}

function in_bounds(array: unknown[][], position: [number, number]): boolean {
  return (
    position[0] >= 0 &&
    position[0] < array[0].length &&
    position[1] >= 0 &&
    position[1] < array.length
  );
}

function make_search(
  input: string[][],
  position: [number, number],
  dx: number,
  dy: number,
  index: number
): boolean {
  if (index >= search.length) return true;

  if (!in_bounds(input, position)) {
    return false;
  }

  if (input[position[0]][position[1]] == search[index]) {
    const new_x = position[0] + dx;
    const new_y = position[1] + dy;

    return make_search(input, [new_x, new_y], dx, dy, index + 1);
  }

  return false;
}

function start_searches(input: string[][], position: [number, number]): number {
  let valid = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx == 0 && dy == 0) continue;

      if (make_search(input, position, dx, dy, 0)) {
        valid++;
      }
    }
  }

  return valid;
}

function get_all_valid(input: string[][]): number {
  let valid = 0;

  for (let y = 0; y < input.length; y++) {
    for (let x = 0; x < input[y].length; x++) {
      valid += start_searches(input, [x, y]);
    }
  }

  return valid;
}

const input = Deno.readTextFileSync("../inputs/day4.txt");
const input_list = split_list(input);
const input_valid = get_all_valid(input_list);
console.log(`First challenge ${input_valid}`);

// second part

function check_char(
  input: string[][],
  position: [number, number],
  char: string
): boolean {
  if (!in_bounds(input, position)) return false;
  return input[position[0]][position[1]] == char;
}

function check_mas(input: string[][], position: [number, number]): boolean {
  if (!check_char(input, position, "A")) return false;

  const left_good =
    (check_char(input, [position[0] - 1, position[1] - 1], "M") &&
      check_char(input, [position[0] + 1, position[1] + 1], "S")) ||
    (check_char(input, [position[0] - 1, position[1] - 1], "S") &&
      check_char(input, [position[0] + 1, position[1] + 1], "M"));

  const right_good =
    (check_char(input, [position[0] + 1, position[1] - 1], "M") &&
      check_char(input, [position[0] - 1, position[1] + 1], "S")) ||
    (check_char(input, [position[0] + 1, position[1] - 1], "S") &&
      check_char(input, [position[0] - 1, position[1] + 1], "M"));

  return left_good && right_good;
}

function get_all_mas(input: string[][]): number {
  let valid = 0;

  for (let y = 0; y < input.length; y++) {
    for (let x = 0; x < input[y].length; x++) {
      valid += check_mas(input, [y, x]) ? 1 : 0;
    }
  }

  return valid;
}

console.log(`Second challenge ${get_all_mas(input_list)}`);
