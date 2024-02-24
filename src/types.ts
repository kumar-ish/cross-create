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

type GridState = {
  grid: Cell[][];
  numberedCells: NumberedCell[][];
  highlightedCell: HighlightedCell;
};

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
  HighlightedCell,
  Coords,
  Cell,
  BlackCell,
  InputCell,
};
