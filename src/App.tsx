import {
  useState,
  useReducer,
  KeyboardEventHandler,
  CSSProperties,
} from "react";
import "./App.css";
import GridWrapper from "./GridWrapper";

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
        return { backgroundColor: "lightpink" };
      case HighlightType.SECONDARY:
        return { backgroundColor: "hotpink" };
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

const Game = () => {
  const [grid, dispatch] = useReducer(reducer, initialState);

  const clickCell = (coords: Coords) => {
    dispatch({
      kind: ActionKind.CLICK_CELL,
      coords,
    });
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
