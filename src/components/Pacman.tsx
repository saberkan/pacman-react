import React from "react";
import styled, { css, keyframes } from "styled-components";
import { Position, pacmanStartPosition } from "../types/position";
import { ARROW, DIRECTION, Direction } from "../types/direction";
import { Character } from "../types/character";
import { useGameContext } from "../context/GameContext";
import { useInterval } from "../hooks/useInterval";
import { GAME_STATUS } from "../types/gameStatus";
import colors from "../styles/Colors";
import {
  snapPositionToFoodGrid,
  stepOnFoodGrid,
} from "../utils/playfieldGridMovement";
import { MOVEMENT_TICK_MS } from "../constants/gameplayPacing";

interface StyledPacmanProps {
  direction: Direction;
  position: Position;
  isAlive: boolean;
  $powerMode: boolean;
}

type PacmanMouthProps = {
  moving: boolean;
};

const Pacman = (props: Character) => {
  const {
    pacmanPosition: position,
    setPacmanPosition,
    gameStatus,
    playfieldGrid,
    powerModeActive,
    tryPowerEatFromPacmanMove,
  } = useGameContext();
  const gameStatusRef = React.useRef(gameStatus);
  React.useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

  const positionRef = React.useRef(position);
  positionRef.current = position;

  const [direction, setDirection] = React.useState<Direction>(DIRECTION.RIGHT);
  const directionRef = React.useRef(direction);
  directionRef.current = direction;

  const playfieldGridRef = React.useRef(playfieldGrid);
  React.useEffect(() => {
    playfieldGridRef.current = playfieldGrid;
  }, [playfieldGrid]);

  React.useLayoutEffect(() => {
    if (
      !playfieldGrid ||
      playfieldGrid.cols <= 0 ||
      playfieldGrid.rows <= 0
    ) {
      return;
    }
    const p = positionRef.current;
    const snapped = snapPositionToFoodGrid(p, playfieldGrid);
    if (snapped.left !== p.left || snapped.top !== p.top) {
      setPacmanPosition(snapped);
    }
  }, [playfieldGrid, setPacmanPosition]);

  useInterval(move, MOVEMENT_TICK_MS);

  React.useEffect(() => {
    function rotate(keypressed: number) {
      switch (keypressed) {
        case ARROW.LEFT:
          setDirection(DIRECTION.LEFT);
          break;
        case ARROW.UP:
          setDirection(DIRECTION.UP);
          break;
        case ARROW.RIGHT:
          setDirection(DIRECTION.RIGHT);
          break;
        default:
          setDirection(DIRECTION.DOWN);
      }
    }

    function handleKeyDown(e: any) {
      const arrows = [ARROW.LEFT, ARROW.UP, ARROW.RIGHT, ARROW.DOWN];

      if (arrows.indexOf(e.keyCode) >= 0) {
        rotate(e.keyCode);
      }
    }

    document.addEventListener("keydown", handleKeyDown, false);
    document.addEventListener("restart-game", gameRestarted);

    return () => {
      document.removeEventListener("restart-game", gameRestarted);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function gameRestarted() {
    const g = playfieldGridRef.current;
    if (g && g.cols > 0 && g.rows > 0) {
      setPacmanPosition(snapPositionToFoodGrid(pacmanStartPosition, g));
    }
  }

  function move() {
    const status = gameStatusRef.current;
    if (status === GAME_STATUS.IN_PROGRESS) {
      const g = playfieldGridRef.current;
      if (!g || g.cols <= 0 || g.rows <= 0) {
        return;
      }
      const next = stepOnFoodGrid(
        positionRef.current,
        directionRef.current,
        g
      );
      if (next) {
        setPacmanPosition(next);
        tryPowerEatFromPacmanMove(next, props.size);
      }
    }
  }

  return (
    <StyledPacman
      tabIndex={0}
      position={position}
      direction={direction}
      isAlive={gameStatus !== GAME_STATUS.LOST}
      $powerMode={powerModeActive && gameStatus === GAME_STATUS.IN_PROGRESS}
    >
      <PacmanEye />
      <PacmanMouth moving={gameStatus === GAME_STATUS.IN_PROGRESS} />
    </StyledPacman>
  );
};

const eat = keyframes`
  0% {
    clip-path: polygon(100% 74%, 44% 48%, 100% 21%);
  }
  25% {
    clip-path: polygon(100% 60%, 44% 48%, 100% 35%);
  }
  50% {
    clip-path: polygon(100% 50%, 44% 48%, 100% 60%);
  }
  75% {
    clip-path: polygon(100% 59%, 44% 48%, 100% 35%);
  }
  100% {
    clip-path: polygon(100% 74%, 44% 48%, 100% 21%);
  }
`;

/** Pulses between pellet yellow and playfield wall white (Scene border #fff). */
const wallPowerPulse = keyframes`
  0%,
  100% {
    background: ${colors.color2};
    box-shadow:
      inset 0 0 0 1px rgba(0, 0, 0, 0.2),
      0 0 0 0 rgba(255, 255, 255, 0);
  }
  50% {
    background: #ffffff;
    box-shadow:
      inset 0 0 0 1px rgba(0, 0, 0, 0.35),
      inset 0 0 10px rgba(0, 0, 0, 0.2),
      0 0 16px rgba(255, 255, 255, 0.95);
  }
`;

const StyledPacman = styled.div<StyledPacmanProps>`
  width: 60px;
  height: 63px;
  position: absolute;
  top: ${(props) => props.position.top}px;
  left: ${(props) => props.position.left}px;
  transform: ${(props) => {
    switch (props.direction) {
      case DIRECTION.LEFT:
        return "rotateY(180deg)";
      case DIRECTION.UP:
        return "rotate(-90deg)";
      case DIRECTION.DOWN:
        return "rotate(90deg)";
      default:
        return "rotate(0deg)";
    }
  }};
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${(props) => (props.isAlive ? colors.color2 : "white")};

  ${(p) =>
    p.$powerMode && p.isAlive
      ? css`
          animation: ${wallPowerPulse} 0.48s ease-in-out infinite;
        `
      : css``}
`;

const PacmanEye = styled.div`
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  top: 10px;
  right: 26px;
  background: ${colors.color1};
`;

const PacmanMouth = styled.div<PacmanMouthProps>`
  animation-name: ${eat};
  animation-duration: 0.7s;
  animation-iteration-count: ${(props) =>
    props.moving ? "infinite" : "initial"};
  background: ${colors.color1};
  position: absolute;
  width: 100%;
  height: 100%;
  clip-path: polygon(100% 74%, 44% 48%, 100% 21%);
`;

export default Pacman;
