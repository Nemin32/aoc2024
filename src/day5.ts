type PrecedenceMap = Map<string, Set<string>>;

const sample = `47|53
97|13
97|61
97|47
75|29
61|13
75|53
29|13
97|29
53|29
61|53
97|53
61|29
47|13
75|47
97|75
47|61
75|61
47|29
75|13
53|13

75,47,61,53,29
97,61,53,29,13
75,29,13
75,97,47,61,53
61,13,29
97,13,75,29,47`;

function process_input(
  input: string
): [PrecedenceMap, PrecedenceMap, string[][]] {
  const precedence_map: PrecedenceMap = new Map();
  const follow_map: PrecedenceMap = new Map();
  const [precedences, lists] = input.split("\n\n");

  for (const line of precedences.split("\n")) {
    const [precedes, follows] = line.split("|");
    const precedence_set = precedence_map.get(precedes) ?? new Set<string>();
    const follow_set = follow_map.get(follows) ?? new Set<string>();

    precedence_set.add(follows);
    precedence_map.set(precedes, precedence_set);

    follow_set.add(precedes);
    follow_map.set(follows, follow_set);
  }

  return [
    precedence_map,
    follow_map,
    lists.split("\n").map((line) => line.split(",")),
  ];
}

function check_line(line: string[], precedence_map: PrecedenceMap): boolean {
  for (let i = 0; i < line.length; i++) {
    const current = line[i];
    const previous = new Set(line.slice(0, i));
    const precedence = precedence_map.get(current) ?? new Set<string>();

    const intersect = previous.intersection(precedence);

    if (intersect.size > 0) {
      return false;
    }
  }

  return true;
}

function filter_valid(
  lines: string[][],
  precedence_map: PrecedenceMap
): string[][] {
  return lines.filter((line) => check_line(line, premap));
}

function get_sum(lines: string[][]): number {
  function middle(line: string[]) {
    return Number(line[Math.floor(line.length / 2)]);
  }

  return lines.map(middle).reduce((a, c) => a + c, 0);
}

const input = Deno.readTextFileSync("../inputs/day5.txt");
const [premap, followmap, lines] = process_input(input);

console.log(`First challenge ${get_sum(filter_valid(lines, premap))}`);

// second part

function filter_invalid(
  lines: string[][],
  precedence_map: PrecedenceMap
): string[][] {
  return lines.filter((line) => !check_line(line, precedence_map));
}

// 97,13,75,29,47 becomes 97,75,47,29,13.

function make_swap(
  input: string[],
  index: number,
  follow_map: PrecedenceMap
): [boolean, string[]] {
  const copy = [...input];
  let swappos = -1;
  let temp = "";

  const set = follow_map.get(input[index]) ?? new Set<string>();
  for (let i = index + 1; i < input.length; i++) {
    if (set.has(input[i])) {
      swappos = i;
    }
  }

  if (swappos >= 0) {
    temp = copy[index];
    copy[index] = copy[swappos];
    copy[swappos] = temp;
  }

  return [swappos !== -1, copy];
}

function sort_line(
  line: string[],
  index: number,
  follow_map: PrecedenceMap
): string[] {
  if (index >= line.length) return line;

  const [did_swap, new_line] = make_swap(line, index, follow_map);

  return sort_line(new_line, index + (did_swap ? 0 : 1), follow_map);
}

const invalids = filter_invalid(lines, premap);
const sorted_invalids = invalids.map((line) => sort_line(line, 0, followmap));
const sum = get_sum(sorted_invalids);

console.log(`Second challenge ${sum}`);
