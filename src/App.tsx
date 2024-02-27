import {
  useState,
  useReducer,
  KeyboardEventHandler,
  CSSProperties,
} from "react";
import "./App.css";
import GridWrapper from "./GridWrapper";

import reducer, {
  handleClickCell,
  handleWriteClue,
  initialState,
} from "./reducer";
import {
  CellKind,
  Coords,
  CrosswordOrientation,
  GameGrid,
  Cell,
  NumberedCell,
  ClueIndex,
} from "./types";
import { coordsEqual } from "./grid";
import styled from "styled-components";

enum HighlightType {
  NONE,
  PRIMARY,
  SECONDARY,
}
const cellSize = 40; // TODO: was 50 before

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
  enum HighlightStyle {
    AQUAMAREINISH,
    GIRL,
    NEUTRAL,
  }

  const highlightStyles: {
    [style in HighlightStyle]: {
      [kind in CellKind]: {
        [type in HighlightType]: CSSProperties;
      };
    };
  } = {
    [HighlightStyle.AQUAMAREINISH]: {
      [CellKind.BLACK]: {
        [HighlightType.NONE]: { backgroundColor: "black" },
        [HighlightType.PRIMARY]: {
          background: "linear-gradient(to right, #238d91, #7bbe5ee7)",
        },
        [HighlightType.SECONDARY]: { backgroundColor: "black" },
      },
      [CellKind.INPUT]: {
        [HighlightType.NONE]: {},
        [HighlightType.PRIMARY]: { backgroundColor: "#238d91" },
        [HighlightType.SECONDARY]: { backgroundColor: "#7bbe5ee7" },
      },
    },
    [HighlightStyle.GIRL]: {
      [CellKind.BLACK]: {
        [HighlightType.NONE]: { backgroundColor: "black" },
        [HighlightType.PRIMARY]: {
          background: "linear-gradient(to right, hotpink, lightpink)",
        },
        [HighlightType.SECONDARY]: { backgroundColor: "black" },
      },
      [CellKind.INPUT]: {
        [HighlightType.NONE]: {},
        [HighlightType.PRIMARY]: { backgroundColor: "hotpink" },
        [HighlightType.SECONDARY]: { backgroundColor: "lightpink" },
      },
    },
    [HighlightStyle.NEUTRAL]: {
      [CellKind.BLACK]: {
        [HighlightType.NONE]: {},
        [HighlightType.PRIMARY]: {},
        [HighlightType.SECONDARY]: {},
      },
      [CellKind.INPUT]: {
        [HighlightType.NONE]: {},
        [HighlightType.PRIMARY]: {},
        [HighlightType.SECONDARY]: {},
      },
    },
  };

  const highlightCSS = (
    cell: Cell,
    highlight: HighlightType,
    style: HighlightStyle = HighlightStyle.AQUAMAREINISH
  ) => {
    return highlightStyles[style][cell.kind][highlight];
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
    border: "2px solid black",
    // TODO: change this
    height: cellSize - 4,
    width: cellSize - 4,
    borderRadius: "50%",
  };

  return (
    <td
      style={{
        padding: "0px",
        ...highlightCSS(cell, highlightType),
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
              fontSize: `${180 / Math.sqrt(cell.content.length)}%`,
              lineHeight: `${Math.sqrt(cell.content.length) * 165}%`,
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
          }}
        />
      )}
    </td>
  );
};

const GridTable = styled.table`
  border-spacing: 1px;
  border: 2px solid black;
`;

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
      <GridTable>
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
      </GridTable>
    </div>
  );
};

const ClueIndexDiv = styled.div`
  text-align: center;
`;

const Clue = ({
  index,
  across,
  word,
}: {
  index: number;
  across: boolean;
  word: string;
  existingClue?: string;
}) => {
  return (
    // TODO: fix the spacing between words
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "40px 40px",
        paddingTop: "1px",
        paddingBottom: "1px",
      }}
    >
      <ClueIndexDiv>{index + (across ? "A" : "D")}</ClueIndexDiv>

      <div
        style={{
          marginLeft: "1px",
        }}
      >
        <div>
          <b>{word}</b>
        </div>
        <div
          style={{ backgroundColor: "lightgray", width: "200px" }}
          hidden={word.indexOf("_") !== -1}
        >
          <input
            contentEditable={true}
            onChange={(x) => {}}
            style={{
              display: "inline-block",
              border: "none",
              fontFamily: "inherit",
              fontSize: "inherit",
              padding: "none",
              width: "auto",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const Clues = (props: {
  // TODO: stinky silly
  words: (Coords & ClueIndex)[];
  across: boolean;
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        // fontFamily: "Roboto Mono",
        maxHeight: "350px",
        width: "300px",
      }}
    >
      <div
        style={{
          minWidth: "175px",
          marginLeft: "10px",
          overflow: "scroll",
          border: "3px solid black",
          display: "grid",
        }}
      >
        <p style={{ textAlign: "center", alignItems: "center", margin: "3px" }}>
          <u>{props.across ? "ACROSSES" : "DOWNS"}</u>
        </p>
        <div>
          {props.words.map((x) => {
            // const word = props.across
            //   ? findWord(x.j, grid.grid[x.i])
            //   : findWord(x.i, transposed[x.j]);
            return <Clue index={x.index} across={props.across} word={x.word} />;
          })}
        </div>
      </div>
    </div>
  );
};

const Game = () => {
  const [grid, dispatch] = useReducer(reducer, initialState);

  const clickCell = (coords: Coords) => {
    handleClickCell(dispatch, coords);
  };

  return (
    <div style={{ display: "flex", maxHeight: "650px", alignItems: "center" }}>
      <GridWrapper dispatch={dispatch}>
        <Grid gridState={grid} clickCell={clickCell} />
      </GridWrapper>
      {/* <Clues grid/> */}
      <div
        style={{
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          width: "200px",
          // maxHeight: "300px",
          gap: "10px",
        }}
      >
        {/* <CluesWrapper> */}
        <Clues words={grid.words[0]} across={true} />
        <Clues words={grid.words[1]} across={false} />
        {/* </CluesWrapper> */}
      </div>
    </div>
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

//   let time: number;
//  const randomSquareHopper = () => {
//    window.onload = resetTimer;
//    // DOM Events
//    document.onmousemove = resetTimer;
//    document.onkeydown = resetTimer;
//
//    function reset() {
//      const blackcells = grid.grid
//        .flatMap((x, i) => x.map((y, j) => ({ i, j, ...y })))
//        .filter((x) => x.kind === CellKind.BLACK);
//      const picked = blackcells[Math.floor(Math.random() * blackcells.length)];
//      handleClickCell(dispatch, { row: picked.i, column: picked.j });
//    }
//
//    function resetTimer() {
//      clearTimeout(time);
//      time = setInterval(reset, 1000);
//      // 1000 milliseconds = 1 second
//    }
//  };
// randomSquareHopper();
