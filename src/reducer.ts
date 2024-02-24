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

const defaultHighlight: HighlightedCell = {
  row: 0,
  column: 0,
  direction: CrosswordOrientation.ACROSS,
};

const initialState: GridState = {
  grid: defaultGrid,
  highlightedCell: defaultHighlight,
  numberedCells: numberCells(defaultGrid),
};

const emptyInputCell = (): InputCell => ({
  kind: CellKind.INPUT,
  content: "",
  circled: false,
});

const emptyBlackCell = (): BlackCell => ({ kind: CellKind.BLACK });

const toggleKind = (cell: Cell) => {
  switch (cell.kind) {
    case CellKind.BLACK:
      return emptyInputCell();
    case CellKind.INPUT:
      return emptyBlackCell();
  }
};

const coordsEqual = (c1: Coords, c2: Coords) => {
  return c1.column === c2.column && c1.row === c2.row;
};

const cycle = (dir: CrosswordOrientation) => {
  return dir === CrosswordOrientation.ACROSS
    ? CrosswordOrientation.DOWN
    : CrosswordOrientation.ACROSS;
};

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

  const updateInputCell = (coords: Coords, f: (_: InputCell) => InputCell) => {
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

const handleBackspace = (dispatch: (_: Action) => void) => {
  dispatch({ kind: ActionKind.BACKSPACE });
};
const handleToggleBlack = (dispatch: (_: Action) => void) => {
  dispatch({ kind: ActionKind.TOGGLE_BLACK });
};

const handleToggleCircle = (dispatch: (_: Action) => void) => {
  dispatch({ kind: ActionKind.TOGGLE_CIRCLE });
};

const handleWriteLetter = (
  dispatch: (_: Action) => void,
  letter: string,
  rebus: boolean
) => {
  dispatch({
    kind: ActionKind.WRITE_LETTER,
    letter,
    rebus,
  });
};
