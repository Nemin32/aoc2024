const sample = `....#.....
.........#
..........
..#.......
.......#..
..........
.#..^.....
........#.
#.........
......#...`;

type Position = { x: number; y: number };

const enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

class PositionSet extends Set<Position> {
  add(o: Position) {
    if (!this.has(o)) {
      super.add.call(this, o);
    }

    return this;
  }

  has(o: Position) {
    for (const i of this) if (this.deepCompare(o, i)) return true;
    return false;
  }

  private deepCompare(o: Position, i: Position) {
    return o.x == i.x && o.y == i.y;
  }
}

class PositionMap extends Map<Position, Direction[]> {
  get(key: Position) {
    for (const [k, v] of this) {
      if (k.x == key.x && k.y == key.y) return v;
    }

    return undefined;
  }

  update(
    key: Position,
    updateFunc: (arr: Direction[]) => Direction[],
    defaultValue: Direction[]
  ) {
    const current = this.get(key);

    if (current) {
      super.set.call(this, key, updateFunc(current));
    } else {
      super.set.call(this, key, defaultValue);
    }

    return this;
  }
}

type State = {
  starting_position: Position;
  player_pos: Position;
  player_direction: Direction;
  obstacles: PositionSet;
  visited_positions: PositionSet;
  dimensions: { width: number; height: number };
  hits: PositionMap;
};

function parse_input(input: string): State {
  function find_obstacles(input: string[][]): PositionSet {
    const set = new PositionSet();

    for (let y = 0; y < input.length; y++) {
      for (let x = 0; x < input[y].length; x++) {
        if (input[y][x] == "#") {
          set.add({ x, y });
        }
      }
    }

    return set;
  }

  function find_player(input: string[][]): Position {
    for (let y = 0; y < input.length; y++) {
      for (let x = 0; x < input[y].length; x++) {
        if (input[y][x] === "^") return { x, y };
      }
    }

    throw new Error("Can't find player!");
  }

  const split_input = input.split("\n").map((line) => line.split(""));
  const player_pos = find_player(split_input);

  return {
    starting_position: player_pos,
    player_pos,
    obstacles: find_obstacles(split_input),
    player_direction: Direction.UP,
    visited_positions: new PositionSet([player_pos]),
    dimensions: { height: split_input.length, width: split_input[0].length },
    hits: new PositionMap(),
  };
}

function is_out_of_bounds(state: State): boolean {
  const { x, y } = state.player_pos;
  const { width, height } = state.dimensions;

  return x < 0 || y < 0 || x >= width || y >= height;
}

function do_step(state: State): State {
  function get_new_position(state: State): Position {
    const pos = state.player_pos;
    let change = { dx: 0, dy: 0 };

    switch (state.player_direction) {
      case Direction.UP:
        change.dy = -1;
        break;
      case Direction.DOWN:
        change.dy = 1;
        break;
      case Direction.LEFT:
        change.dx = -1;
        break;
      case Direction.RIGHT:
        change.dx = 1;
        break;
    }

    return {
      x: pos.x + change.dx,
      y: pos.y + change.dy,
    };
  }

  function rotate_player(dir: Direction): Direction {
    switch (dir) {
      case Direction.UP:
        return Direction.RIGHT;
      case Direction.DOWN:
        return Direction.LEFT;
      case Direction.LEFT:
        return Direction.UP;
      case Direction.RIGHT:
        return Direction.DOWN;
    }
  }

  function is_wall(pos: Position, state: State) {
    return state.obstacles.has(pos);
  }

  function make_step(
    pos: Position,
    state: State
  ): Pick<
    State,
    "player_direction" | "player_pos" | "visited_positions" | "hits"
  > {
    if (is_wall(pos, state)) {
      return {
        player_direction: rotate_player(state.player_direction),
        player_pos: state.player_pos,
        visited_positions: state.visited_positions,
        hits: state.hits.update(
          pos,
          (arr) => arr.concat(state.player_direction),
          [state.player_direction]
        ),
      };
    } else {
      return {
        player_direction: state.player_direction,
        player_pos: pos,
        visited_positions: state.visited_positions.add(pos),
        hits: state.hits,
      };
    }
  }

  const new_position = get_new_position(state);

  const new_state = {
    ...state,
    ...make_step(new_position, state),
  };

  return new_state;
}

function iterate(state: State): State {
  if (is_out_of_bounds(state)) {
    return state;
  } else {
    return iterate(do_step(state));
  }
}

const input = Deno.readTextFileSync("../inputs/day6.txt");
const inital_state = parse_input(input);
const final_state = iterate(inital_state);

console.log(`First challenge ${final_state.visited_positions.size - 1}`);

// second part

function generate_potential_new_solutions(state: State): State[] {
  const { x: px, y: py } = state.player_pos;
  return Array.from(state.visited_positions)
    .map((a: Position): State | null => {
      // Don't wall the player in.
      if (a.x == px && a.y == py) return null;

      const new_obstacles = new PositionSet([...state.obstacles]);

      return {
        ...state,
        obstacles: new_obstacles.add(a),
        player_pos: state.starting_position,
        player_direction: Direction.UP,
        visited_positions: new PositionSet([state.starting_position]),
        hits: new PositionMap(),
      };
    })
    .filter((e) => e !== null);
}

function is_loop(state: State): boolean {
  return Array.from(state.hits).some(([k, v]) => new Set(v).size !== v.length);
}

function check_if_loop(state: State): boolean {
  let next_state = state;

  while (true) {
    if (is_out_of_bounds(next_state)) {
      return false;
    }

    if (next_state.visited_positions.size > 1 && is_loop(next_state)) {
      return true;
    }

    next_state = do_step(next_state);
  }
}

//const sample_initial = parse_input(sample);
//const sample_final = iterate(sample_initial);
//const possible = generate_potential_new_solutions(sample_final);

//console.log(possible.map(check_if_loop).filter((a) => a).length);

console.log("Generating");
const possible = generate_potential_new_solutions(final_state);
console.log("Generating done");
let sum = 0;

for (let i = 0; i < possible.length; i++) {
  console.log(`Starting ${i + 1}. state.`);

  const loop = check_if_loop(possible[i]);

  console.log(`${i + 1}. state is ${loop ? "LOOP" : "NOT LOOP"}`);

  if (loop) sum++;
}

// 1939
console.log(sum);
