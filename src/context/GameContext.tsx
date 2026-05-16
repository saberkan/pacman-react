import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Position, pacmanStartPosition } from "../types/position";
import { GAME_STATUS, GameStatus } from "../types/gameStatus";
import { PlayfieldSize } from "../utils/clampCharacterToPlayfield";
import { PlayfieldGrid } from "../utils/playfieldGridMovement";
import { POWER_MODE_DURATION_MS } from "../constants/powerMode";
import { pacGhostHitBoxOverlap } from "../utils/characterOverlap";

export type PowerEatGhostBinding = {
  getPosition: () => Position;
  size: number;
  onEaten: () => void;
};

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
  /** True while the 5s power window after eating a special pellet is active. */
  powerModeActive: boolean;
  /** Restarts / extends the 5s power window (standard refresh on re-eat). */
  startOrRefreshPowerMode: () => void;
  /** Register a ghost for Pac-Man movement-based power eating; returns cleanup. */
  registerPowerEatGhost: (
    id: string,
    binding: PowerEatGhostBinding,
  ) => () => void;
  /** When Pac-Man steps, any overlapping registered ghost is eaten (power mode only). */
  tryPowerEatFromPacmanMove: (pac: Position, pacSize: number) => void;
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
  powerModeActive: false,
  startOrRefreshPowerMode: () => {},
  registerPowerEatGhost: () => () => {},
  tryPowerEatFromPacmanMove: () => {},
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

  const [powerModeActive, _setPowerModeActive] = useState(false);
  const powerModeActiveRef = useRef(powerModeActive);
  powerModeActiveRef.current = powerModeActive;

  const powerEatRegistryRef = useRef(
    new Map<string, PowerEatGhostBinding>(),
  );

  const registerPowerEatGhost = useCallback(
    (id: string, binding: PowerEatGhostBinding) => {
      powerEatRegistryRef.current.set(id, binding);
      return () => {
        powerEatRegistryRef.current.delete(id);
      };
    },
    [],
  );

  const tryPowerEatFromPacmanMove = useCallback(
    (pac: Position, pacSize: number) => {
      if (!powerModeActiveRef.current) {
        return;
      }
      powerEatRegistryRef.current.forEach((b) => {
        const g = b.getPosition();
        if (pacGhostHitBoxOverlap(pac, g, b.size)) {
          b.onEaten();
        }
      });
    },
    [],
  );

  const powerModeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const clearPowerModeTimeout = useCallback(() => {
    if (powerModeTimeoutRef.current) {
      clearTimeout(powerModeTimeoutRef.current);
      powerModeTimeoutRef.current = null;
    }
  }, []);

  const startOrRefreshPowerMode = useCallback(() => {
    clearPowerModeTimeout();
    _setPowerModeActive(true);
    powerModeTimeoutRef.current = setTimeout(() => {
      _setPowerModeActive(false);
      powerModeTimeoutRef.current = null;
    }, POWER_MODE_DURATION_MS);
  }, [clearPowerModeTimeout]);

  useEffect(() => {
    return () => {
      clearPowerModeTimeout();
    };
  }, [clearPowerModeTimeout]);

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
    clearPowerModeTimeout();
    _setPowerModeActive(false);
    powerEatRegistryRef.current.clear();
    _setPoints(0);
    _setGameStatus(GAME_STATUS.IN_PROGRESS);
    _setPacmanPosition(pacmanStartPosition);

    const event = new Event("restart-game");
    document.dispatchEvent(event);
  }, [clearPowerModeTimeout]);

  const value = {
    foodAmount,
    gameStatus,
    pacmanPosition,
    points,
    playfieldInnerSize,
    playfieldGrid,
    restartGame,
    powerModeActive,
    startOrRefreshPowerMode,
    registerPowerEatGhost,
    tryPowerEatFromPacmanMove,
    setFoodAmount,
    setGameStatus,
    setPacmanPosition,
    setPlayfieldGrid,
    setPlayfieldInnerSize,
    setPoints,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
