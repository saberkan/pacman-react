import React from "react";
import styled from "styled-components";
import { Position } from "../types/position";
import colors from "../styles/Colors";
import { useGameContext } from "../context/GameContext";
import { GAME_STATUS } from "../types/gameStatus";

interface StyledFoodProps {
  position: Position;
  hidden: boolean;
  $cellWidth: number;
  $cellHeight: number;
}

const eatPrecision = 18;

export type FoodProps = {
  name: string;
  position: Position;
  hidden: boolean;
  pacmanSize: number;
  /** Matches playfield grid pitch (default 60). */
  cellWidth?: number;
  cellHeight?: number;
};

const Food = (props: FoodProps) => {
  const cellWidth = props.cellWidth ?? 60;
  const cellHeight = props.cellHeight ?? 60;
  const position = props.position;
  const [isHidden, setIsHidden] = React.useState(false);
  const {
    pacmanPosition,
    setPoints,
    points,
    foodAmount,
    setGameStatus,
    gameStatus,
  } = useGameContext();

  function eaten() {
    setIsHidden(true);
  }

  React.useEffect(() => {
    function gameRestarted() {
      setIsHidden(false);
    }

    document.addEventListener("restart-game", gameRestarted);
    return () => document.removeEventListener("restart-game", gameRestarted);
  }, []);

  React.useEffect(() => {
    if (
      gameStatus === GAME_STATUS.IN_PROGRESS &&
      !isHidden &&
      pacmanPosition.left + (props.pacmanSize - eatPrecision) / 2 >=
        position.left &&
      pacmanPosition.left - (props.pacmanSize - eatPrecision) / 2 <
        position.left &&
      pacmanPosition.top + (props.pacmanSize - eatPrecision) / 2 >=
        position.top &&
      pacmanPosition.top - (props.pacmanSize - eatPrecision) / 2 < position.top
    ) {
      eaten();
      if (foodAmount === points + 1) {
        setGameStatus(GAME_STATUS.WON);
      }
      setPoints(points + 1);
    }
  }, [pacmanPosition, position, gameStatus, isHidden]);

  return (
    <StyledFood
      position={props.position}
      hidden={isHidden}
      $cellWidth={cellWidth}
      $cellHeight={cellHeight}
    >
      <div className="effective-food"></div>
    </StyledFood>
  );
};

const StyledFood = styled.div<StyledFoodProps>`
  width: ${(props) => props.$cellWidth}px;
  height: ${(props) => props.$cellHeight}px;
  position: absolute;
  display: ${(props) => (props.hidden ? "none" : "flex")};
  align-items: center;
  justify-content: center;
  top: ${(props) => props.position.top}px;
  left: ${(props) => props.position.left}px;

  .effective-food {
    border-radius: 50px;
    width: 10px;
    height: 10px;
    background-color: ${colors.color2};
    flex-shrink: 0;
  }
`;

export default Food;
