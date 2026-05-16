import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from "react";
import { Position, pacmanStartPosition } from "../types/position";
import { GAME_STATUS, GameStatus } from "../types/gameStatus";
import { PlayfieldSize } from "../utils/clampCharacterToPlayfield";
import { PlayfieldGrid } from "../utils/playfieldGridMovement";

type GameContextType = {
  foodAmount: number;
  gameStatus: GameStatus;
  pacmanPosition: Position;
  points: number;
  /** Inner drawable size of the scene (matches food grid area). */
  playfieldInnerSize: PlayfieldSize | null;
  /** Pellet grid: same pitch and layout as Food cells. */
  playfieldGrid: PlayfieldGrid | null;
  setFoodAmount: (foodAmount: number) => void;
  setPacmanPosition: (position: Position) => void;
  setPoints: (points: number) => void;
  setGameStatus: (gameStatus: GameStatus) => void;
  setPlayfieldInnerSize: (size: PlayfieldSize | null) => void;
  setPlayfieldGrid: (grid: PlayfieldGrid | null) => void;
  restartGame: () => void;
};

const contextDefaultValues: GameContextType = {
  foodAmount: 0,
  gameStatus: GAME_STATUS.READY,
  pacmanPosition: { top: 0, left: 0 },
  points: 0,
  playfieldInnerSize: null,
  playfieldGrid: null,
  setFoodAmount: () => {},
  setPacmanPosition: () => {},
  setPoints: () => {},
  setGameStatus: () => {},
  setPlayfieldInnerSize: () => {},
  setPlayfieldGrid: () => {},
  restartGame: () => {},
};

const GameContext = createContext<GameContextType>(contextDefaultValues);

export function useGameContext() {
  return useContext(GameContext);
}

type Props = {
  children: ReactNode;
};

export function GameProvider({ children }: Props) {
  const [pacmanPosition, _setPacmanPosition] = useState<Position>(
    contextDefaultValues.pacmanPosition
  );
  const [points, _setPoints] = useState<number>(contextDefaultValues.points);
  const [foodAmount, _setFoodAmount] = useState<number>(
    contextDefaultValues.foodAmount
  );

  const [gameStatus, _setGameStatus] = useState<GameStatus>(
    contextDefaultValues.gameStatus
  );

  const [playfieldInnerSize, _setPlayfieldInnerSize] =
    useState<PlayfieldSize | null>(contextDefaultValues.playfieldInnerSize);

  const [playfieldGrid, _setPlayfieldGrid] = useState<PlayfieldGrid | null>(
    contextDefaultValues.playfieldGrid
  );

  const setFoodAmount = useCallback((foodAmount: number) => {
    _setFoodAmount(foodAmount);
  }, []);

  const setGameStatus = useCallback((gameStatus: GameStatus) => {
    _setGameStatus(gameStatus);
  }, []);

  const setPacmanPosition = useCallback((pacmanPosition: Position) => {
    _setPacmanPosition(pacmanPosition);
  }, []);

  const setPoints = useCallback((points: number) => {
    _setPoints(points);
  }, []);

  const setPlayfieldInnerSize = useCallback((size: PlayfieldSize | null) => {
    _setPlayfieldInnerSize(size);
  }, []);

  const setPlayfieldGrid = useCallback((grid: PlayfieldGrid | null) => {
    _setPlayfieldGrid(grid);
  }, []);

  const restartGame = useCallback(() => {
    _setPoints(0);
    _setGameStatus(GAME_STATUS.IN_PROGRESS);
    _setPacmanPosition(pacmanStartPosition);

    const event = new Event("restart-game");
    document.dispatchEvent(event);
  }, []);

  const value = {
    foodAmount,
    gameStatus,
    pacmanPosition,
    points,
    playfieldInnerSize,
    playfieldGrid,
    restartGame,
    setFoodAmount,
    setGameStatus,
    setPacmanPosition,
    setPlayfieldGrid,
    setPlayfieldInnerSize,
    setPoints,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
