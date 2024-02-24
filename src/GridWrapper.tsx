const GridWrapper = ({ dispatch }: { dispatch: (Action) => void }) => {
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

  return <div onKeyDown={handleKey} tabIndex={0}></div>;
};

export default { GridWrapper };
