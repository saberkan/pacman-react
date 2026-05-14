import React from "react";
import Pacman from "./Pacman";
import Ghost from "./Ghost";
import Food from "./Food";
import styled from "styled-components";
import colors from "../styles/Colors";
import { useGameContext } from "../context/GameContext";
import { GAME_STATUS } from "../types/gameStatus";
import { COLOR } from "../types/color";

type SceneProps = {
  foodSize: number;
  border: number;
  topScoreBoard: number;
};

const pacmanSize = 60;
const pacmanVelocity = 30;
const ghostSize = 60;
const topScoreBoardHeight = 100;

const generateFoodMatrix = (props: SceneProps, amountOfFood: number) => {
  let currentTop = 0;
  let currentLeft = 0;
  const foods = [];

  for (let i = 0; i <= amountOfFood; i++) {
    if (currentLeft + props.foodSize >= window.innerWidth - props.border) {
      currentTop += props.foodSize;
      currentLeft = 0;
    }
    if (
      currentTop + props.foodSize >=
      window.innerHeight - props.border - props.topScoreBoard
    ) {
      break;
    }
    const position = { left: currentLeft, top: currentTop };
    currentLeft = currentLeft + props.foodSize;
    foods.push(
      <Food
        pacmanSize={pacmanSize}
        hidden={false}
        name={"food" + i}
        position={position}
        key={i}
      />
    );
  }
  return foods;
};

const easyGhostVelocity = 15;

const Scene = (props: SceneProps) => {
  const {
    setFoodAmount,
    restartGame,
    foodAmount,
    gameStatus,
    setGameStatus,
  } = useGameContext();

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
    const amountOfFood =
      Math.floor((window.innerWidth - props.border) / props.foodSize) *
      Math.floor(
        (window.innerHeight - props.border - props.topScoreBoard) /
          props.foodSize
      );

    setFoodAmount(amountOfFood);
  }, []);

  return (
    <StyledScene>
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
      {generateFoodMatrix(props, foodAmount)}
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
      ></Ghost>
      <Ghost
        velocity={easyGhostVelocity}
        size={ghostSize}
        border={20}
        topScoreBoard={topScoreBoardHeight}
        color={COLOR.GREEN}
        name="ghost2"
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
  height: calc(100vh - 120px);
  width: calc(var(--container-width));
  background-color: ${colors.color1};
  position: relative;
  border: 10px ${colors.color3} solid;
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
