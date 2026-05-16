import React from "react";
import Pacman from "./Pacman";
import Ghost from "./Ghost";
import Food from "./Food";
import styled from "styled-components";
import colors from "../styles/Colors";
import { useGameContext } from "../context/GameContext";
import { GAME_STATUS } from "../types/gameStatus";
import { COLOR } from "../types/color";
import { computePlayfieldFoodGrid } from "../utils/computePlayfieldFoodGrid";
import { assignSpecialFoodCells } from "../utils/assignSpecialFoodCells";

type SceneProps = {
  foodSize: number;
  border: number;
  topScoreBoard: number;
};

const pacmanSize = 60;
const pacmanVelocity = 30;
const ghostSize = 60;
const topScoreBoardHeight = 100;

/** When layout metrics are unavailable (e.g. tests), approximate inner size from the window. */
const windowFallbackInnerSize = (p: SceneProps) => ({
  width: Math.max(0, window.innerWidth - p.border),
  height: Math.max(0, window.innerHeight - p.border - p.topScoreBoard),
});

const generateFoodMatrix = (
  cols: number,
  rows: number,
  cellWidth: number,
  cellHeight: number,
  specialCells: Set<string>,
) => {
  const foods = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const key = `${row}-${col}`;
      foods.push(
        <Food
          pacmanSize={pacmanSize}
          hidden={false}
          name={`food-${key}`}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          position={{
            left: col * cellWidth,
            top: row * cellHeight,
          }}
          variant={specialCells.has(key) ? "special" : "normal"}
          key={key}
        />
      );
    }
  }
  return foods;
};

const easyGhostVelocity = 15;

const Scene = (props: SceneProps) => {
  const {
    setFoodAmount,
    setPlayfieldInnerSize,
    setPlayfieldGrid,
    restartGame,
    gameStatus,
    setGameStatus,
  } = useGameContext();

  const sceneRef = React.useRef<HTMLDivElement>(null);
  const [foodGrid, setFoodGrid] = React.useState<{
    cols: number;
    rows: number;
    cellWidth: number;
    cellHeight: number;
  } | null>(null);
  const [specialFoodCells, setSpecialFoodCells] = React.useState<
    Set<string>
  >(() => new Set());
  const foodGridRef = React.useRef(foodGrid);
  React.useEffect(() => {
    foodGridRef.current = foodGrid;
  }, [foodGrid]);

  const gameStatusRef = React.useRef(gameStatus);
  React.useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isSpace =
        e.code === "Space" ||
        e.key === " " ||
        e.key === "Spacebar";
      if (!isSpace) {
        return;
      }
      if (gameStatusRef.current === GAME_STATUS.IN_PROGRESS) {
        e.preventDefault();
        e.stopPropagation();
        setGameStatus(GAME_STATUS.PAUSED);
      } else if (gameStatusRef.current === GAME_STATUS.PAUSED) {
        e.preventDefault();
        e.stopPropagation();
        setGameStatus(GAME_STATUS.IN_PROGRESS);
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [setGameStatus]);

  React.useEffect(() => {
    if (gameStatus !== GAME_STATUS.PAUSED) {
      return;
    }
    const resume = () => {
      setGameStatus(GAME_STATUS.IN_PROGRESS);
    };
    window.addEventListener("pointerdown", resume, true);
    window.addEventListener("click", resume, true);
    return () => {
      window.removeEventListener("pointerdown", resume, true);
      window.removeEventListener("click", resume, true);
    };
  }, [gameStatus, setGameStatus]);

  React.useEffect(() => {
    const onRestart = () => {
      const g = foodGridRef.current;
      if (!g) {
        return;
      }
      setSpecialFoodCells(assignSpecialFoodCells(g.cols, g.rows));
    };
    document.addEventListener("restart-game", onRestart);
    return () => document.removeEventListener("restart-game", onRestart);
  }, []);

  React.useLayoutEffect(() => {
    const node = sceneRef.current;
    if (!node) {
      return;
    }

    const syncGridFromScene = () => {
      const el = sceneRef.current;
      if (!el) {
        return;
      }
      const w = el.clientWidth;
      const h = el.clientHeight;
      let cols: number;
      let rows: number;
      let innerWidthPx: number;
      let innerHeightPx: number;

      if (w > 0 && h > 0) {
        innerWidthPx = w;
        innerHeightPx = h;
      } else {
        const fb = windowFallbackInnerSize(props);
        innerWidthPx = fb.width;
        innerHeightPx = fb.height;
      }

      const computed = computePlayfieldFoodGrid(
        innerWidthPx,
        innerHeightPx,
        props.foodSize
      );
      cols = computed.cols;
      rows = computed.rows;

      setFoodGrid({
        cols,
        rows,
        cellWidth: computed.cellWidth,
        cellHeight: computed.cellHeight,
      });
      setSpecialFoodCells(assignSpecialFoodCells(cols, rows));
      setFoodAmount(cols * rows);
      setPlayfieldInnerSize({ width: innerWidthPx, height: innerHeightPx });
      setPlayfieldGrid({
        cols,
        rows,
        cellWidth: computed.cellWidth,
        cellHeight: computed.cellHeight,
      });
    };

    syncGridFromScene();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(syncGridFromScene)
        : null;
    observer?.observe(node);

    return () => observer?.disconnect();
  }, [
    props.foodSize,
    props.border,
    props.topScoreBoard,
    setFoodAmount,
    setPlayfieldInnerSize,
    setPlayfieldGrid,
  ]);

  return (
    <StyledScene ref={sceneRef}>
      {gameStatus === GAME_STATUS.PAUSED && (
        <PauseOverlay aria-hidden>
          <PauseMessage>Paused — click anywhere to resume</PauseMessage>
        </PauseOverlay>
      )}
      {gameStatus !== GAME_STATUS.IN_PROGRESS &&
        gameStatus !== GAME_STATUS.PAUSED && (
          <OverlayContent>
            {gameStatus === GAME_STATUS.READY ? (
              <CenterContainer>
                <StyledButton
                  type="button"
                  onClick={() => setGameStatus(GAME_STATUS.IN_PROGRESS)}
                >
                  Start
                </StyledButton>
              </CenterContainer>
            ) : gameStatus === GAME_STATUS.WON ? (
              <CenterContainer>
                <div>
                  <strong>Congratulations :)</strong>
                </div>
                <StyledButton type="button" onClick={() => restartGame()}>
                  Play again
                </StyledButton>
              </CenterContainer>
            ) : (
              <CenterContainer>
                <div>
                  <strong>GAME OVER :(</strong>
                </div>
                <StyledButton type="button" onClick={() => restartGame()}>
                  Try Again
                </StyledButton>
              </CenterContainer>
            )}
          </OverlayContent>
        )}
      {foodGrid
        ? generateFoodMatrix(
            foodGrid.cols,
            foodGrid.rows,
            foodGrid.cellWidth,
            foodGrid.cellHeight,
            specialFoodCells,
          )
        : null}
      <Pacman
        velocity={pacmanVelocity}
        size={pacmanSize}
        border={20}
        topScoreBoard={topScoreBoardHeight}
        name="pacman"
        color={colors.color2}
      ></Pacman>
      <Ghost
        velocity={easyGhostVelocity}
        size={ghostSize}
        border={20}
        topScoreBoard={topScoreBoardHeight}
        color={COLOR.RED}
        name="ghost1"
        respawnSlot={0}
      ></Ghost>
      <Ghost
        velocity={easyGhostVelocity}
        size={ghostSize}
        border={20}
        topScoreBoard={topScoreBoardHeight}
        color={COLOR.GREEN}
        name="ghost2"
        respawnSlot={1}
      ></Ghost>
    </StyledScene>
  );
};

const PauseOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 8000;
  background-color: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const PauseMessage = styled.div`
  font-size: 32px;
  color: #fff;
  text-align: center;
  pointer-events: none;
  user-select: none;
`;

const CenterContainer = styled.div`
  position: absolute;
  margin: 0 auto;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 9999;
  background-color: ${colors.color2};
  color: ${colors.color3};
  padding: 20px;
  button {
    cursor: pointer;
  }
`;

const OverlayContent = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  font-size: 40px;
`;

const StyledScene = styled.div`
  --container-width: 100vw - 20px;
  --wall-thickness: 14px;
  height: calc(100vh - 120px);
  width: calc(var(--container-width));
  background-color: ${colors.color1};
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  border: var(--wall-thickness) #fff solid;
  box-shadow:
    inset 0 0 0 1px rgba(0, 0, 0, 0.35),
    inset 0 0 10px rgba(0, 0, 0, 0.2);
`;

const StyledButton = styled.button`
  padding: 8px 16px;
  font-size: 24px;
  background-color: ${colors.color1};
  color: ${colors.color2};
  border: 1px ${colors.color3} solid;
  cursor: pointer;

  :hover {
    background-color: ${colors.color2};
    color: ${colors.color1};
  }
`;

export default Scene;
