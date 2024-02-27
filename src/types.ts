export enum CellKind {
  BLACK,
  INPUT,
}

type InputCell = {
  kind: CellKind.INPUT;
  content: string;
  circled: boolean;
  // other characteristics?
};

type BlackCell = { kind: CellKind.BLACK };

type Cell = InputCell | BlackCell;
export enum HighlightedType {
  PRIMARY,
  SECONDARY,
  NONE,
}

type Coords = {
  row: number;
  column: number;
};
type HighlightedCell = Coords & { orientation: CrosswordOrientation };

type NumberedCell = {
  validAcross: boolean;
  validDown: boolean;
  index?: number;

  acrossWordIndex?: number;
  downWordIndex?: number;
};
type IndexCell = NumberedCell & Coords;

type ClueEntry = {
  clue: string;
};

type ClueIndex = { word: string; index: number };

type GridState = {
  grid: Cell[][];
  numberedCells: NumberedCell[][];
  highlightedCell: HighlightedCell;

  // This is empty entirely until somebody writes a clue associated
  // `clues` has no data outside
  clues: Map<string, ClueEntry[]>;

  words: {
    [orientation in CrosswordOrientation]: (Coords & ClueIndex)[];
  };
};
// Rendering the list of clues
// map over the "answers" in the grid, and try to find matching clues for it in the map
// [A N SWE R] =>

type GameGrid = {
  gridState: GridState;
  clickCell: (coords: Coords) => void;
};

export enum CrosswordOrientation {
  ACROSS,
  DOWN,
}
export enum Direction {
  FORWARDS,
  BACKWARDS,
}

export type {
  GameGrid,
  GridState,
  NumberedCell,
  IndexCell,
  ClueIndex,
  HighlightedCell,
  Coords,
  Cell,
  BlackCell,
  InputCell,
};
