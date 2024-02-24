import { KeyboardEventHandler } from "react";
import {
  handleFindNext,
  handleMove,
  handleWriteLetter,
  handleToggleCircle,
  handleToggleBlack,
  handleBackspace,
  handleToggleDirection,
  ActionDispatcher,
} from "./reducer";
import { CrosswordOrientation, Direction } from "./types";

const GridWrapper = ({
  dispatch,
  children,
}: {
  dispatch: ActionDispatcher;
  children: JSX.Element;
}) => {
  const handleKey: KeyboardEventHandler<HTMLDivElement> = (ev) => {
    if (ev.code === "Backspace") {
      handleBackspace(dispatch);
    }
    if (ev.key === ".") {
      handleToggleBlack(dispatch);
    }
    if (ev.key === ",") {
      handleToggleCircle(dispatch);
    }
    if (/^[A-Za-z]{1}$/.test(ev.key)) {
      handleWriteLetter(dispatch, ev.key, ev.shiftKey);
    }
    if (ev.key == " ") {
      handleToggleDirection(dispatch);
    }
    if (ev.key === "Tab") {
      handleFindNext(dispatch);
    }
    const dirMap: { [key: string]: [CrosswordOrientation, Direction] } = {
      ArrowUp: [CrosswordOrientation.DOWN, Direction.BACKWARDS],
      ArrowDown: [CrosswordOrientation.DOWN, Direction.FORWARDS],
      ArrowLeft: [CrosswordOrientation.ACROSS, Direction.BACKWARDS],
      ArrowRight: [CrosswordOrientation.ACROSS, Direction.FORWARDS],
    };
    if (ev.key in dirMap) {
      const [orientation, direction] = dirMap[ev.key];
      handleMove(dispatch, orientation, direction);
    }
  };

  return (
    <div onKeyDown={handleKey} tabIndex={0}>
      {children}
    </div>
  );
};

export default GridWrapper;
