enum CellKind {
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
enum HighlightedType {
  PRIMARY,
  SECONDARY,
  NONE,
}

type Coords = {
  row: number;
  column: number;
};
type HighlightedCell = Coords & { direction: CrosswordOrientation };

type NumberedCell = {
  validAcross: boolean;
  validDown: boolean;
  index?: number;

  acrossWordIndex?: number;
  downWordIndex?: number;
};

type GridState = {
  grid: Cell[][];
  numberedCells: NumberedCell[][];
  highlightedCell: HighlightedCell;
};

type GameGrid = {
  gridState: GridState;
  clickCell: (coords: Coords) => void;
};

enum CrosswordOrientation {
  ACROSS,
  DOWN,
}
enum Direction {
  FORWARDS,
  BACKWARDS,
}
