import { coordsEqual, findWords, numberCells } from "./grid";
import { defaultGrid } from "./grid";
import {
  BlackCell,
  Cell,
  CellKind,
  Coords,
  CrosswordOrientation,
  Direction,
  GridState,
  HighlightedCell,
  IndexCell,
  InputCell,
  NumberedCell,
  ClueIndex,
} from "./types";

enum ActionKind {
  BACKSPACE,
  TOGGLE_BLACK,
  TOGGLE_CIRCLE,
  TOGGLE_DIRECTION,
  WRITE_LETTER,
  CLICK_CELL,
  FIND_NEXT,
  MOVE,
  WRITE_CLUE,
}
type BackspaceAction = { kind: ActionKind.BACKSPACE; rebus: boolean };

type ToggleBlackAction = { kind: ActionKind.TOGGLE_BLACK };
type ToggleCircleAction = { kind: ActionKind.TOGGLE_CIRCLE };
type ToggleDirectionAction = { kind: ActionKind.TOGGLE_DIRECTION };
type FindNextAction = { kind: ActionKind.FIND_NEXT; reverse: boolean };
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

type WriteClueAction = {
  kind: ActionKind.WRITE_CLUE;
  content: string;
} & ClueIndex;

type Action =
  | BackspaceAction
  | ToggleBlackAction
  | ToggleCircleAction
  | ToggleDirectionAction
  | WriteLetterAction
  | ClickCellAction
  | FindNextAction
  | MoveAction
  | WriteClueAction;

type ActionDispatcher = (_: Action) => void;

const defaultHighlight: HighlightedCell = {
  row: 0,
  column: 0,
  orientation: CrosswordOrientation.ACROSS,
};

const emptyInputCell = (): InputCell => ({
  kind: CellKind.INPUT,
  content: "",
  circled: false,
});

const emptyBlackCell = (): BlackCell => ({ kind: CellKind.BLACK });

const generateRandomGrid = (
  size: number = 15,
  probabilityBlack: number = 0.25
): GridState => {
  const generatedGrid = Array.from({ length: size }, (r) =>
    Array.from({ length: size }, (e) =>
      Math.random() < probabilityBlack
        ? emptyBlackCell()
        : {
            content: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[
              Math.floor(Math.random() * 26)
            ],
            circled: false,
            kind: CellKind.INPUT,
          }
    )
  );

  const numberedCells = numberCells(generatedGrid);
  return {
    grid: generatedGrid,
    highlightedCell: defaultHighlight,
    numberedCells,
    words: findWords(generatedGrid, numberedCells),

    clues: new Map(),
  };
};
const initialState: GridState = generateRandomGrid();

const toggleKind = (cell: Cell) => {
  switch (cell.kind) {
    case CellKind.BLACK:
      return emptyInputCell();
    case CellKind.INPUT:
      return emptyBlackCell();
  }
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
  const { grid, highlightedCell, numberedCells }: GridState = gridState;
  const reducerHelper = (newState: Partial<GridState>): GridState => {
    return { ...gridState, ...newState };
  };
  const reducerHelperWithRecomputedWords = (
    //TODO: think about these types better
    newState: Partial<GridState>
  ): GridState => {
    const state = { ...gridState, ...newState };
    const numberedCells = numberCells(state.grid);
    const words = findWords(grid, numberedCells);

    return { ...state, numberedCells, words };
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
    orientation: CrosswordOrientation = highlightedCell.orientation
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
      orientation: cycle(highlightedCell.orientation),
    });

  switch (action.kind) {
    case ActionKind.BACKSPACE:
      updateCell(highlightedCell, (cell) => {
        switch (cell.kind) {
          case CellKind.BLACK:
            return emptyInputCell();
          case CellKind.INPUT:
            return {
              ...cell,
              content: action.rebus
                ? cell.content.substring(0, cell.content.length - 1)
                : "",
            };
        }
      });

      const movedCoords = action.rebus
        ? highlightedCell
        : moveDirection(Direction.BACKWARDS);

      return reducerHelperWithRecomputedWords({
        highlightedCell: { ...highlightedCell, ...movedCoords },
      });
    case ActionKind.TOGGLE_BLACK:
      updateCell(highlightedCell, toggleKind);
      return reducerHelperWithRecomputedWords({
        highlightedCell: {
          ...highlightedCell,
          ...moveDirection(Direction.FORWARDS),
        },
      });

    case ActionKind.TOGGLE_CIRCLE:
      console.log(highlightedCell);
      updateInputCell(highlightedCell, (cell) => {
        return { ...cell, circled: !cell.circled };
      });
      return { ...gridState };
    case ActionKind.TOGGLE_DIRECTION:
      return toggleDirection();
    case ActionKind.WRITE_LETTER:
      const allCaps = action.letter === " " ? "" : action.letter.toUpperCase();

      updateCell(highlightedCell, (c) => {
        switch (c.kind) {
          case CellKind.BLACK:
            return { ...emptyInputCell(), content: allCaps };

          case CellKind.INPUT:
            return {
              ...c,
              content: action.rebus ? c.content + allCaps : allCaps,
            };
        }
      });
      return reducerHelperWithRecomputedWords({
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
      if (
        grid[highlightedCell.row][highlightedCell.column].kind ===
        CellKind.BLACK
      ) {
        return highlightedCellHelper({
          ...moveDirection(action.direction, action.orientation),
          orientation: action.orientation,
        });
      }
      if (action.orientation != highlightedCell.orientation) {
        return toggleDirection();
      } else {
        return highlightedCellHelper({ ...moveDirection(action.direction) });
      }
    case ActionKind.FIND_NEXT:
      const findNextCell = (
        starting: Coords = { ...highlightedCell }
      ): IndexCell | undefined => {
        const allCells: IndexCell[] = numberedCells.flatMap((cells, row) =>
          cells.map((cell, column) => ({ ...cell, row, column }))
        );

        const acrossCells = allCells
          .filter((cell) => cell.validAcross)
          .map((cell) => ({
            ...cell,
            orientation: CrosswordOrientation.ACROSS,
          }));
        const downCells = allCells
          .filter((cell) => cell.validDown)
          .map((cell) => ({ ...cell, orientation: CrosswordOrientation.DOWN }));

        type Xd = IndexCell & { orientation: CrosswordOrientation };

        const findNext = (sameOrientation: Xd[], oppositeOrientation: Xd[]) => {
          if (action.reverse) {
            sameOrientation.reverse();
            oppositeOrientation.reverse();
          }
          return (
            sameOrientation.find((cell) => {
              if (action.reverse) {
                return (
                  (cell.row === starting.row &&
                    cell.column < starting.column) ||
                  cell.row < starting.row
                );
              } else {
                return (
                  cell.row > starting.row ||
                  (cell.row === starting.row && cell.column > starting.column)
                );
              }
            }) ??
            oppositeOrientation[0] ??
            sameOrientation[0]
          );
        };

        // TODO(somebody): refactor
        switch (highlightedCell.orientation) {
          case CrosswordOrientation.ACROSS:
            return findNext(acrossCells, downCells);
          case CrosswordOrientation.DOWN:
            return findNext(downCells, acrossCells);
        }
      };

      return highlightedCellHelper({ ...findNextCell() });
    default:
      return gridState;
  }
};

const handleToggleDirection = (dispatch: ActionDispatcher) => {
  dispatch({ kind: ActionKind.TOGGLE_DIRECTION });
};

const handleBackspace = (dispatch: ActionDispatcher, rebus: boolean) => {
  dispatch({ kind: ActionKind.BACKSPACE, rebus });
};

const handleToggleBlack = (dispatch: ActionDispatcher) => {
  dispatch({ kind: ActionKind.TOGGLE_BLACK });
};

const handleToggleCircle = (dispatch: ActionDispatcher) => {
  dispatch({ kind: ActionKind.TOGGLE_CIRCLE });
};

const handleWriteLetter = (
  dispatch: ActionDispatcher,
  letter: string,
  rebus: boolean
) => {
  dispatch({
    kind: ActionKind.WRITE_LETTER,
    letter,
    rebus,
  });
};

const handleMove = (
  dispatch: ActionDispatcher,
  orientation: CrosswordOrientation,
  direction: Direction
) => {
  dispatch({
    kind: ActionKind.MOVE,
    orientation,
    direction,
  });
};

const handleClickCell = (dispatch: ActionDispatcher, coords: Coords) => {
  dispatch({
    kind: ActionKind.CLICK_CELL,
    coords,
  });
};

const handleFindNext = (dispatch: ActionDispatcher, reverse: boolean) => {
  dispatch({ kind: ActionKind.FIND_NEXT, reverse });
};

const handleWriteClue = (
  dispatch: ActionDispatcher,
  index: ClueIndex,
  content: string
) => {
  dispatch({ ...index, kind: ActionKind.WRITE_CLUE, content });
};

export {
  handleFindNext,
  handleMove,
  handleWriteLetter,
  handleToggleCircle,
  handleToggleBlack,
  handleBackspace,
  handleToggleDirection,
  handleClickCell,
  handleWriteClue,
};
export { emptyBlackCell, generateRandomGrid };
export { initialState };
export type { ActionDispatcher };

export default reducer;
