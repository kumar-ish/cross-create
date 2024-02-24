import { Cell, CellKind, Coords, NumberedCell } from "./types";

const defaultGrid = [
  [
    { content: "xx", circled: false, kind: CellKind.BLACK },
    { content: "X", circled: false, kind: CellKind.INPUT },
    { content: "X", circled: false, kind: CellKind.INPUT },
    { content: "X", circled: false, kind: CellKind.INPUT },
  ],
  [
    { content: "X", circled: false, kind: CellKind.INPUT },
    { content: "X", circled: false, kind: CellKind.INPUT },
    { content: "X", circled: false, kind: CellKind.INPUT },
    { content: "X", circled: false, kind: CellKind.INPUT },
  ],
  [
    { content: "X", circled: false, kind: CellKind.INPUT },
    { content: "X", circled: false, kind: CellKind.INPUT },
    { content: "X", circled: false, kind: CellKind.INPUT },
    { content: "X", circled: false, kind: CellKind.INPUT },
  ],
  [
    { content: "X", circled: false, kind: CellKind.INPUT },
    { content: "X", circled: false, kind: CellKind.INPUT },
    { content: "X", circled: false, kind: CellKind.INPUT },
    { content: "X", circled: false, kind: CellKind.INPUT },
  ],
];

const coordsEqual = (c1: Coords, c2: Coords) => {
  return c1.column === c2.column && c1.row === c2.row;
};

const numberCells = (grid: Cell[][]): NumberedCell[][] => {
  let k = 0;
  let l = 0;
  let lastAcross: number | undefined = 0;
  const lastDown = new Array(grid[0].length).fill(0);
  return grid.map((row, i) =>
    row.map((cell, j) => {
      const cellBeforeCheck = (cell: Cell, cellBefore?: Cell) =>
        cell.kind === CellKind.INPUT &&
        (cellBefore === undefined || cellBefore.kind === CellKind.BLACK);
      const valid = (cell: Cell, cellBefore?: Cell, cellAfter?: Cell) =>
        cellBeforeCheck(cell, cellBefore) &&
        cellAfter !== undefined &&
        cellAfter.kind === CellKind.INPUT;

      const gridValue = (i: number, j: number) => {
        return grid[i] ? grid[i][j] : undefined;
      };

      const validAcross = valid(cell, gridValue(i, j - 1), gridValue(i, j + 1));
      const validDown = valid(cell, gridValue(i - 1, j), gridValue(i + 1, j));
      const validAcrossSection = cellBeforeCheck(cell, gridValue(i, j - 1));
      const validDownSection = cellBeforeCheck(cell, gridValue(i - 1, j));
      const index = validAcross || validDown ? ++k : undefined;
      validAcrossSection || validDownSection ? ++l : undefined;
      if (validAcrossSection) {
        lastAcross = l;
      }
      if (validDownSection) {
        lastDown[j] = l;
      }
      if (cell.kind == CellKind.BLACK) {
        lastAcross = undefined;
        lastDown[j] = undefined;
      }

      return {
        index,
        validAcross,
        validDown,
        acrossWordIndex: lastAcross,
        downWordIndex: lastDown[j],
      };
    })
  );
};

export { numberCells, coordsEqual, defaultGrid };
