import {
  useState,
  useReducer,
  KeyboardEventHandler,
  CSSProperties,
} from "react";
import "./App.css";

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

const emptyInputCell = (): InputCell => ({
  kind: CellKind.INPUT,
  content: "",
  circled: false,
});

type BlackCell = { kind: CellKind.BLACK };
const emptyBlackCell = (): BlackCell => ({ kind: CellKind.BLACK });

type Cell = InputCell | BlackCell;
enum HighlightType {
  PRIMARY,
  SECONDARY,
  NONE,
}

const toggleKind = (cell: Cell) => {
  switch (cell.kind) {
    case CellKind.BLACK:
      return emptyInputCell();
    case CellKind.INPUT:
      return emptyBlackCell();
  }
};

type Coords = {
  row: number;
  column: number;
};
type HighlightedCell = Coords & { direction: CrosswordOrientation };
const coordsEqual = (c1: Coords, c2: Coords) => {
  return c1.column === c2.column && c1.row === c2.row;
};

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
const cycle = (dir: CrosswordOrientation) => {
  return dir === CrosswordOrientation.ACROSS
    ? CrosswordOrientation.DOWN
    : CrosswordOrientation.ACROSS;
};

const Cell = ({
  cell,
  highlightType,
  onClick,
}: {
  cell: Cell;
  highlightType: HighlightType;
  onClick: () => void;
}) => {
  const minSquareCSS: CSSProperties = {
    minWidth: "25px",
    minHeight: "25px",
    maxWidth: "25px",
    maxHeight: "25px",
    outline: "solid black",
  };
  const highlightCSSInput = (highlightType: HighlightType): CSSProperties => {
    switch (highlightType) {
      case HighlightType.NONE:
        return {};
      case HighlightType.PRIMARY:
        return { backgroundColor: "#4A8FB5" };
      case HighlightType.SECONDARY:
        return { backgroundColor: "#B5704A" };
    }
  };

  const highlightCSSBlack = (highlightType: HighlightType): CSSProperties => {
    switch (highlightType) {
      case HighlightType.PRIMARY:
        return { background: "linear-gradient(to right, #4A8FB5, #B5704A)" };
      default:
        return { backgroundColor: "black" };
    }
  };

  return (
    <td>
      {cell.kind === CellKind.INPUT ? (
        <div
          onClick={onClick}
          style={{
            ...minSquareCSS,
            ...highlightCSSInput(highlightType),
            fontSize: `${100 / Math.sqrt(cell.content.length)}%`,
            lineHeight: `${Math.sqrt(cell.content.length) * 150}%`,
          }}
          tabIndex={0}
        >
          {cell.content}
        </div>
      ) : (
        <div
          onClick={onClick}
          style={{
            ...minSquareCSS,
            ...highlightCSSBlack(highlightType),
          }}
          tabIndex={1}
        />
      )}
    </td>
  );
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

const Grid = ({ gridState, clickCell }: GameGrid) => {
  const { highlightedCell, grid, numberedCells } = gridState;

  const getHighlightedType = (coords: Coords): HighlightType => {
    // if (
    //   grid[highlightedCell.row][highlightedCell.column].kind == CellKind.BLACK
    // ) {
    //   return HighlightType.NONE;
    // }
    if (coordsEqual(coords, highlightedCell)) {
      return HighlightType.PRIMARY;
    }
    const { row, column } = highlightedCell;
    const highlightCell = numberedCells[row][column];
    const desiredCell = numberedCells[coords.row][coords.column];

    if (
      (highlightedCell.direction === CrosswordOrientation.ACROSS &&
        highlightCell.acrossWordIndex === desiredCell.acrossWordIndex) ||
      (highlightedCell.direction === CrosswordOrientation.DOWN &&
        highlightCell.downWordIndex === desiredCell.downWordIndex)
    ) {
      return HighlightType.SECONDARY;
    }
    return HighlightType.NONE;
  };

  return (
    <div>
      <table style={{ borderCollapse: "collapse", borderSpacing: "0px" }}>
        <tbody>
          {grid.map((row, i) => (
            <tr>
              {row.map((cell, j) => (
                <Cell
                  cell={cell}
                  highlightType={getHighlightedType({ row: i, column: j })}
                  onClick={() => clickCell({ row: i, column: j })}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const defaultHighlight: HighlightedCell = {
  row: 0,
  column: 0,
  direction: CrosswordOrientation.ACROSS,
};

const GameEventWrapper = () => {};

enum ActionKind {
  BACKSPACE,
  TOGGLE_BLACK,
  TOGGLE_CIRCLE,
  TOGGLE_DIRECTION,
  WRITE_LETTER,
  CLICK_CELL,
  FIND_NEXT,
  MOVE,
}
type BackspaceAction = { kind: ActionKind.BACKSPACE };

type ToggleBlackAction = { kind: ActionKind.TOGGLE_BLACK };
type ToggleCircleAction = { kind: ActionKind.TOGGLE_CIRCLE };
type ToggleDirectionAction = { kind: ActionKind.TOGGLE_DIRECTION };
type FindNextAction = { kind: ActionKind.FIND_NEXT };
type MoveAction = {
  kind: ActionKind.MOVE;
  orientation: CrosswordOrientation;
  direction: Direction;
};

type WriteLetterAction = {
  kind: ActionKind.WRITE_LETTER;
  letter: string;
  rebus: boolean;
};
type ClickCellAction = { kind: ActionKind.CLICK_CELL; coords: Coords };

type Action =
  | BackspaceAction
  | ToggleBlackAction
  | ToggleCircleAction
  | ToggleDirectionAction
  | WriteLetterAction
  | ClickCellAction
  | FindNextAction
  | MoveAction;

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

const updateCellAt = (
  gridState: Cell[][],
  coords: Coords,
  f: (_: Cell) => Cell
) => {
  const { row, column } = coords;
  gridState[row][column] = f(gridState[row][column]);
};

// Returns a number clamped between [min, max)
const clamp = (num: number, min: number, max: number) => {
  return Math.max(min, Math.min(num, max - 1));
};

const Game = () => {
  const initialState: GridState = {
    grid: defaultGrid,
    highlightedCell: defaultHighlight,
    numberedCells: numberCells(defaultGrid),
  };

  const reducer = (gridState: GridState, action: Action): GridState => {
    const { grid, highlightedCell }: GridState = gridState;
    const reducerHelper = (newState: Partial<GridState>): GridState => {
      return { ...gridState, ...newState };
    };
    const highlightedCellHelper = (
      newState: Partial<HighlightedCell>
    ): GridState => {
      return reducerHelper({
        highlightedCell: { ...highlightedCell, ...newState },
      });
    };
    const addCoords = (c1: Coords, c2: Coords): Coords => {
      return { row: c1.row + c2.row, column: c1.column + c2.column };
    };

    const updateInputCell = (
      coords: Coords,
      f: (_: InputCell) => InputCell
    ) => {
      // updateCellAt(gridState.grid, coords, f)

      updateCellAt(grid, coords, (cell) => {
        switch (cell.kind) {
          case CellKind.BLACK:
            return cell;
          case CellKind.INPUT:
            return f(cell);
        }
      });
    };

    const updateCell = (coords: Coords, f: (_: Cell) => Cell) => {
      updateCellAt(grid, coords, f);
    };

    const toggleDirection = () =>
      highlightedCellHelper({
        direction: cycle(highlightedCell.direction),
      });

    const moveDirection = (
      direction: Direction,
      orientation: CrosswordOrientation = highlightedCell.direction
    ) => {
      let { row, column } = highlightedCell;
      const multiplier = (() => {
        switch (direction) {
          case Direction.FORWARDS:
            return -1;
          case Direction.BACKWARDS:
            return 1;
        }
      })();

      switch (orientation) {
        case CrosswordOrientation.DOWN:
          row = clamp(row - 1 * multiplier, 0, grid.length);
          break;
        case CrosswordOrientation.ACROSS:
          column = clamp(column - 1 * multiplier, 0, grid[0].length);
      }
      return { row, column };
    };

    switch (action.kind) {
      case ActionKind.BACKSPACE:
        updateCell(highlightedCell, (cell) => {
          switch (cell.kind) {
            case CellKind.BLACK:
              return emptyInputCell();
            case CellKind.INPUT:
              return { ...cell, content: "" };
          }
        });

        const movedCoords = moveDirection(Direction.BACKWARDS);
        return reducerHelper({
          highlightedCell: { ...highlightedCell, ...movedCoords },
          numberedCells: numberCells(grid),
        });
      case ActionKind.TOGGLE_BLACK:
        updateCell(highlightedCell, toggleKind);
        return reducerHelper({
          numberedCells: numberCells(grid),
          highlightedCell: {
            ...highlightedCell,
            ...moveDirection(Direction.FORWARDS),
          },
        });

      case ActionKind.TOGGLE_CIRCLE:
        updateInputCell(highlightedCell, (cell) => {
          return { ...cell, circled: !cell.circled };
        });
        return { ...gridState };
      case ActionKind.TOGGLE_DIRECTION:
        return toggleDirection();
      case ActionKind.WRITE_LETTER:
        const allCaps = action.letter.toUpperCase();

        updateInputCell(highlightedCell, (c) => {
          return {
            ...c,
            content: action.rebus ? c.content + allCaps : allCaps,
          };
        });
        return reducerHelper({
          highlightedCell: {
            ...highlightedCell,
            ...(action.rebus ? undefined : moveDirection(Direction.FORWARDS)),
          },
        });

      case ActionKind.CLICK_CELL:
        if (coordsEqual(action.coords, gridState.highlightedCell)) {
          return toggleDirection();
        } else {
          return highlightedCellHelper({
            ...action.coords,
          });
        }
      case ActionKind.MOVE:
        if (action.orientation != highlightedCell.direction) {
          return toggleDirection();
        } else {
          return highlightedCellHelper({ ...moveDirection(action.direction) });
        }
      case ActionKind.FIND_NEXT:
      // TODO
      default:
        return gridState;
    }
  };
  // const reducer = (prev: GridState, next: Partial<GridState>) => {
  //   return { ...prev, ...next };
  // };

  const [grid, dispatch] = useReducer(reducer, initialState);

  const handleKey: KeyboardEventHandler<HTMLDivElement> = (ev) => {
    if (ev.code === "Backspace") {
      dispatch({ kind: ActionKind.BACKSPACE });
    }
    if (ev.key === ".") {
      dispatch({ kind: ActionKind.TOGGLE_BLACK });
    }
    if (ev.key === ",") {
      dispatch({ kind: ActionKind.TOGGLE_CIRCLE });
    }
    if (/^[A-Za-z]{1}$/.test(ev.key)) {
      dispatch({
        kind: ActionKind.WRITE_LETTER,
        letter: ev.key == " " ? "" : ev.key,
        rebus: ev.shiftKey,
      });
    }
    if (ev.key == " ") {
      dispatch({
        kind: ActionKind.TOGGLE_DIRECTION,
      });
    }
    if (ev.key === "Tab") {
      dispatch({
        kind: ActionKind.FIND_NEXT,
      });
    }
    const dirMap: { [key: string]: [CrosswordOrientation, Direction] } = {
      ArrowUp: [CrosswordOrientation.DOWN, Direction.BACKWARDS],
      ArrowDown: [CrosswordOrientation.DOWN, Direction.FORWARDS],
      ArrowLeft: [CrosswordOrientation.ACROSS, Direction.BACKWARDS],
      ArrowRight: [CrosswordOrientation.ACROSS, Direction.FORWARDS],
    };
    if (ev.key in dirMap) {
      const [orientation, direction] = dirMap[ev.key];
      dispatch({
        kind: ActionKind.MOVE,
        orientation,
        direction,
      });
    }
  };

  const clickCell = (coords: Coords) => {
    // if (grid.grid[coords.row][coords.column].kind === CellKind.BLACK) {
    //   return;
    // }
    dispatch({
      kind: ActionKind.CLICK_CELL,
      coords,
    });
  };
  return (
    <>
      <div onKeyDown={handleKey} tabIndex={0}>
        <Grid gridState={grid} clickCell={clickCell} />
      </div>
      {/* <Clues grid/> */}
      <div>
        <div></div>
      </div>
    </>
  );
};

function App() {
  // const [count, setCount] = useState(0);

  return (
    <>
      <Game />
    </>
  );
}

export default App;
