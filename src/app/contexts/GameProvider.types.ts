import type { Dispatch } from "react";

export type GameAction = 
  | { type: "editKey"; toggled?: boolean; key: number; }

export type GameContextState = {
  editing: {
    toggled: boolean;
    key: number;
  }
}

export type GameContextDispatch = Dispatch<GameAction>;