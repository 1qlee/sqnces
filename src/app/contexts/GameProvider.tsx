import { createContext, useReducer, useContext, type ReactNode } from "react";
import type { GameContextDispatch, GameContextState, GameAction } from "./GameProvider.types";

const defaultGameContext = {
  editing: {
    toggled: false,
    key: 0,
  },
  loading: false,
}

function gameReducer(state: GameContextState, action: GameAction): GameContextState {
  switch (action.type) {
    case "editKey":
      return {
        ...state,
        editing: {
          toggled: action.toggled ?? !state.editing.toggled,
          key: action.key,
        }
      }
    case "loading":
      return {
        ...state,
        loading: action.loading,
      }
    default:
      return state;
  }
}

export const GameContext = createContext(defaultGameContext);
export const GameDispatchContext = createContext<GameContextDispatch>(() => 'GameDispatchContext must be used within a GameProvider');

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, defaultGameContext);

  return (
    <GameContext.Provider value={state}>
      <GameDispatchContext.Provider value={dispatch}>
        {children}
      </GameDispatchContext.Provider>
    </GameContext.Provider>
  )
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}

export function useGameDispatch() {
  const context = useContext(GameDispatchContext);
  if (!context === null) {
    throw new Error("useGameDispatch must be used within a GameProvider");
  }
  return context;
}