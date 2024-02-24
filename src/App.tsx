import {
  useState,
  useReducer,
  KeyboardEventHandler,
  CSSProperties,
} from "react";
import "./App.css";
import GridWrapper from "./GridWrapper";

import reducer, { handleClickCell, initialState } from "./reducer";
import {
  CellKind,
  Coords,
  CrosswordOrientation,
  GameGrid,
  Cell,
} from "./types";
import { coordsEqual } from "./grid";

enum HighlightType {
  NONE,
  PRIMARY,
  SECONDARY,
}
const cellSize = 50;

const GridCell = ({
  cell,
  highlightType,
  onClick,
  wordIndex,
}: {
  cell: Cell;
  highlightType: HighlightType;
  onClick: () => void;
  wordIndex?: number;
}) => {
  const minSquareCSS: CSSProperties = {
    minWidth: cellSize,
    minHeight: cellSize,
    maxWidth: cellSize,
    maxHeight: cellSize,
    outline: "solid black",
  };
  const highlightCSSInput = (highlightType: HighlightType): CSSProperties => {
    switch (highlightType) {
      case HighlightType.NONE:
        return {};
      case HighlightType.PRIMARY:
        return { backgroundColor: "hotpink" };
      case HighlightType.SECONDARY:
        return { backgroundColor: "lightpink" };
    }
  };

  const highlightCSSBlack = (highlightType: HighlightType): CSSProperties => {
    switch (highlightType) {
      case HighlightType.PRIMARY:
        return {
          background: "linear-gradient(to right, hotpink, lightpink)",
        };
      default:
        return { backgroundColor: "black" };
    }
  };

  const hightlightCSS = (cell: Cell, highlight: HighlightType) => {
    if (cell.kind === CellKind.BLACK) {
      return highlightCSSBlack(highlight);
    } else {
      return highlightCSSInput(highlight);
    }
  };

  const WordIndexStyle: CSSProperties = {
    gridArea: "1 / 1 / 2 / 2",
    textAlign: "left",
    fontSize: "12px",
    marginLeft: "1px",
    lineHeight: `${110}%`,
  };

  const CircleStyle: CSSProperties = {
    gridArea: "1 / 1 / 2 / 2",
    border: "0px solid black",
    // TODO: change this
    height: cellSize - 4,
    width: cellSize - 4,
    borderRadius: "50%",
  };

  return (
    <td
      style={{
        padding: "0px",
        ...hightlightCSS(cell, highlightType),
        outline: "solid black",
        borderSpacing: "0px",
        border: "1px solid black", // Add thick border
      }}
      onClick={onClick}
      tabIndex={0}
    >
      {cell.kind === CellKind.INPUT ? (
        <div
          style={{
            display: "grid",
          }}
        >
          <div
            style={{
              ...minSquareCSS,
              fontSize: `${200 / Math.sqrt(cell.content.length)}%`,
              lineHeight: `${Math.sqrt(cell.content.length) * 160}%`,
              gridArea: "1 / 1 / 2 / 2",
              overflow: "hidden",
              clipPath: "50%",
            }}
          >
            {cell.content}
          </div>
          <div style={WordIndexStyle} hidden={!wordIndex}>
            {" "}
            {wordIndex}
          </div>
          {/* This is number */}

          <div hidden={!cell.circled} style={CircleStyle}>
            {}
          </div>
        </div>
      ) : (
        <div
          style={{
            ...minSquareCSS,
            ...highlightCSSBlack(highlightType),
          }}
        />
      )}
    </td>
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
      (highlightedCell.orientation === CrosswordOrientation.ACROSS &&
        highlightCell.acrossWordIndex === desiredCell.acrossWordIndex) ||
      (highlightedCell.orientation === CrosswordOrientation.DOWN &&
        highlightCell.downWordIndex === desiredCell.downWordIndex)
    ) {
      return HighlightType.SECONDARY;
    }
    return HighlightType.NONE;
  };

  const getWordIndex = (coords: Coords) => {
    const { row, column } = coords;
    return numberedCells[row][column].index;
  };

  return (
    <div>
      <table
        style={{
          // borderCollapse: "collapse",
          borderSpacing: "1px",
          border: "2px solid black",
        }}
      >
        <tbody>
          {grid.map((cells, row) => (
            <tr>
              {cells.map((cell, column) => (
                <GridCell
                  cell={cell}
                  highlightType={getHighlightedType({ row, column })}
                  onClick={() => clickCell({ row, column })}
                  wordIndex={getWordIndex({ row, column })}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Game = () => {
  const [grid, dispatch] = useReducer(reducer, initialState);

  const clickCell = (coords: Coords) => {
    handleClickCell(dispatch, coords);
  };
  return (
    <>
      <GridWrapper dispatch={dispatch}>
        <Grid gridState={grid} clickCell={clickCell} />
      </GridWrapper>
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
